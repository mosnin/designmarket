import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  httpAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";

/**
 * STRIPE, OVER THE REST API
 * ========================
 * No SDK. Stripe's HTTP API is form-encoded and stable, and the two calls we
 * need — create a Checkout session, read one back — are shorter written out
 * than the wiring required to run the Node SDK in this runtime. Signature
 * verification uses Web Crypto, which is available where the webhook runs.
 *
 * Everything degrades: with no STRIPE_SECRET_KEY the checkout action returns
 * a clear "billing isn't configured" rather than throwing, so a fork, a
 * preview deploy, or anyone evaluating the repo gets a working app with the
 * upgrade button honestly disabled instead of a 500.
 */

function secret(): string | null {
  return process.env.STRIPE_SECRET_KEY || null;
}

export const configured = query({
  args: {},
  handler: async () => ({
    billing: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID_PRO_MONTHLY),
  }),
});

async function stripe(
  path: string,
  body?: Record<string, string>
): Promise<Record<string, unknown>> {
  const key = secret();
  if (!key) throw new Error("Billing isn't configured on this deployment");

  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      authorization: `Bearer ${key}`,
      ...(body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body ? { body: new URLSearchParams(body).toString() } : {}),
  });

  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const error = json.error as { message?: string } | undefined;
    throw new Error(error?.message ?? "Stripe rejected that request");
  }
  return json;
}

export const checkout = action({
  args: { returnTo: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ url: string } | { error: string }> => {
    if (!secret() || !process.env.STRIPE_PRICE_ID_PRO_MONTHLY) {
      return {
        error:
          "Billing isn't configured on this deployment. An admin can grant Pro directly from the members table.",
      };
    }

    const me = await ctx.runQuery(internal.stripe.viewerForBilling, {});
    if (!me) return { error: "Sign in first" };
    if (me.plan === "pro") return { error: "You're already on Pro" };

    const site = process.env.SITE_URL ?? "http://localhost:3000";
    const back = args.returnTo ?? "/me/settings";

    const session = await stripe("checkout/sessions", {
      mode: "subscription",
      "line_items[0][price]": process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
      "line_items[0][quantity]": "1",
      success_url: `${site}${back}?upgraded=1`,
      cancel_url: `${site}/pricing`,
      // The handle rides along so the webhook can find the account without a
      // second round trip, and without trusting anything the browser sent.
      client_reference_id: me.userId,
      ...(me.stripeCustomerId
        ? { customer: me.stripeCustomerId }
        : me.email
          ? { customer_email: me.email }
          : {}),
      "subscription_data[metadata][userId]": me.userId,
    });

    const url = session.url;
    if (typeof url !== "string") return { error: "Stripe didn't return a checkout URL" };
    return { url };
  },
});

export const viewerForBilling = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;
    const user = await ctx.db.get(userId);
    return {
      userId: userId as string,
      plan: profile.plan,
      email: (user?.email as string | undefined) ?? null,
      stripeCustomerId: profile.stripeCustomerId ?? null,
    };
  },
});

export const applySubscription = internalMutation({
  args: {
    userId: v.string(),
    customerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as Id<"users">))
      .unique();
    if (!profile) return { ok: false };

    await ctx.db.patch(profile._id, {
      plan: args.active ? "pro" : "free",
      ...(args.customerId ? { stripeCustomerId: args.customerId } : {}),
      ...(args.subscriptionId ? { stripeSubscriptionId: args.subscriptionId } : {}),
      ...(args.active && !profile.proSince ? { proSince: Date.now() } : {}),
    });
    return { ok: true };
  },
});

/* ----------------------------------------------------------------- webhook */

/** Constant-time compare, so a signature check can't be timed open. */
function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function signatureIsValid(
  payload: string,
  header: string,
  signingSecret: string
): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(",").map((part) => part.split("=") as [string, string])
  );
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) return false;

  // Five minutes, per Stripe's own guidance — a replayed webhook from an hour
  // ago should not be able to reinstate a cancelled subscription.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  );
  const hex = [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return equal(hex, expected);
}

export const webhook = httpAction(async (ctx, request) => {
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signingSecret) return new Response("Billing isn't configured", { status: 501 });

  const payload = await request.text();
  const header = request.headers.get("stripe-signature") ?? "";
  if (!(await signatureIsValid(payload, header, signingSecret))) {
    return new Response("Bad signature", { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data: { object: Record<string, unknown> };
  };
  const object = event.data.object;

  const userId =
    (object.client_reference_id as string | undefined) ??
    ((object.metadata as Record<string, string> | undefined)?.userId ?? undefined);

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.updated": {
      const status = (object.status as string | undefined) ?? "active";
      const active = status === "active" || status === "trialing" || status === "complete";
      if (userId) {
        await ctx.runMutation(internal.stripe.applySubscription, {
          userId,
          active,
          ...(typeof object.customer === "string" ? { customerId: object.customer } : {}),
          ...(typeof object.subscription === "string"
            ? { subscriptionId: object.subscription }
            : typeof object.id === "string" && event.type === "customer.subscription.updated"
              ? { subscriptionId: object.id }
              : {}),
        });
      }
      break;
    }

    case "customer.subscription.deleted":
      if (userId) {
        await ctx.runMutation(internal.stripe.applySubscription, {
          userId,
          active: false,
        });
      }
      break;

    default:
      // Everything else is acknowledged and ignored — returning non-2xx makes
      // Stripe retry events we were never going to act on.
      break;
  }

  return new Response("ok", { status: 200 });
});
