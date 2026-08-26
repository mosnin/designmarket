import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * MCP over Streamable HTTP.
 *
 * One POST endpoint speaking JSON-RPC 2.0. There is no SSE stream here on
 * purpose: every tool this server exposes is a single request and a single
 * answer, so opening a long-lived channel would add reconnection semantics to
 * buy nothing. The spec permits a plain JSON response to a POST, and that is
 * what a stateless catalogue should return.
 *
 * Auth is a bearer API key, hashed and compared against the stored digest. The
 * plan is re-checked on every call rather than trusted from key creation — a
 * key outlives the subscription that justified it.
 */

const PROTOCOL_VERSION = "2025-06-18";

type JsonRpcId = string | number | null;

function ok(id: JsonRpcId, result: unknown): Response {
  return Response.json({ jsonrpc: "2.0", id, result }, { headers: CORS });
}

function err(id: JsonRpcId, code: number, message: string): Response {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } }, {
    // A JSON-RPC error is a successful HTTP exchange that carries a failure;
    // returning 4xx here makes well-behaved clients retry a request that will
    // never succeed.
    status: 200,
    headers: CORS,
  });
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
};

const TOOLS = [
  {
    name: "search_listings",
    description:
      "Search the index for libraries, tools, MCP servers, skills, APIs and repositories. Filter by the constraints of the project you are working in — React version, styling system, licence — rather than browsing. Returns compact records with install requirements and a Ship Score graded on fetched evidence.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Free text, e.g. 'accessible date picker'" },
        kind: {
          type: "string",
          enum: ["library", "tool", "resource", "mcp", "skill", "api", "repo"],
        },
        category: { type: "string", description: "Category slug" },
        react: {
          type: "string",
          enum: ["18", "19"],
          description: "Your project's React major. Results that require a different one are removed, not down-ranked.",
        },
        styling: { type: "string", description: "e.g. tailwind, css-in-js, unstyled" },
        license: { type: "string", description: "e.g. mit, apache-2.0" },
        limit: { type: "number", description: "Default 12, max 40" },
      },
    },
  },
  {
    name: "get_listing",
    description:
      "Everything known about one listing: description, categories, fetched facts, the full Ship Score breakdown with the evidence behind each dimension, and the components indexed from it.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "get_component",
    description:
      "One component's usage snippet, install command, import line, props and accessibility notes. The snippet shows how to call the real package — it is not a copy of its source.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "install_plan",
    description:
      "Turn a set of listing slugs into something runnable: batched install commands, the items that cannot be installed from a terminal with the reason for each, and a resolved manifest of packages, licences and peer requirements. Commands are derived only from what each listing actually publishes — a listing with no package says so rather than getting an invented command.",
    inputSchema: {
      type: "object",
      properties: {
        slugs: { type: "array", items: { type: "string" } },
        name: { type: "string" },
      },
      required: ["slugs"],
    },
  },
  {
    name: "check_compatibility",
    description:
      "Ask whether a set of listings can live together in your project. Returns the specific conflicts — which two things disagree and what about — rather than a compatibility percentage. Blocking conflicts mean it will not work; friction and legal findings are yours to weigh.",
    inputSchema: {
      type: "object",
      properties: {
        slugs: { type: "array", items: { type: "string" } },
        react: { type: "string", enum: ["18", "19"] },
        styling: { type: "string" },
        rsc: { type: "boolean", description: "True if you render with Server Components" },
      },
      required: ["slugs"],
    },
  },
] as const;

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const handler = httpAction(async (ctx, request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== "POST") {
    return new Response("This endpoint speaks JSON-RPC over POST.", {
      status: 405,
      headers: { ...CORS, Allow: "POST, OPTIONS" },
    });
  }

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32001, message: "Missing API key. Send Authorization: Bearer vtr_…" },
      }),
      {
        status: 401,
        headers: { ...CORS, "content-type": "application/json", "WWW-Authenticate": "Bearer" },
      }
    );
  }

  const key = await ctx.runQuery(internal.apiKeys.byHash, {
    hash: await sha256Hex(token),
  });
  if (!key) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message: "That key is unknown, revoked, or its plan has lapsed.",
        },
      }),
      { status: 401, headers: { ...CORS, "content-type": "application/json" } }
    );
  }

  let body: { id?: JsonRpcId; method?: string; params?: Record<string, unknown> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return err(null, -32700, "Parse error");
  }

  const id = body.id ?? null;
  const method = body.method ?? "";

  // Notifications carry no id and expect no body back.
  if (method.startsWith("notifications/")) {
    return new Response(null, { status: 202, headers: CORS });
  }

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "vitrine", version: "1.0.0" },
        instructions:
          "Search by the constraints of the project you are in, not by popularity. Every figure returned was fetched from GitHub or npm — absent means unverified, never zero.",
      });

    case "ping":
      return ok(id, {});

    case "tools/list":
      return ok(id, { tools: TOOLS });

    case "tools/call": {
      const name = body.params?.name as string | undefined;
      const args = (body.params?.arguments ?? {}) as Args;
      if (!name) return err(id, -32602, "No tool named");

      // Counting the call before running it means a failing tool still shows
      // up in usage — which is what you want when auditing a leaked key.
      await ctx.runMutation(internal.apiKeys.recordUse, {
        id: key.id as Id<"apiKeys">,
      });

      try {
        const result = await callTool(ctx, name, args);
        return ok(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        });
      } catch (thrown) {
        return ok(id, {
          content: [
            {
              type: "text",
              text: thrown instanceof Error ? thrown.message : "The tool failed.",
            },
          ],
          isError: true,
        });
      }
    }

    default:
      return err(id, -32601, `Unknown method: ${method}`);
  }
});

type Ctx = Parameters<Parameters<typeof httpAction>[0]>[0];
type Args = Record<string, unknown>;

/** Tool arguments arrive as untrusted JSON, so every one is read defensively
 *  and a missing required field becomes a sentence an agent can act on. */
function str(args: Args, key: string): string | undefined {
  const value = args[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function requireSlug(args: Args): string {
  const slug = str(args, "slug");
  if (!slug) throw new Error("This tool needs a `slug`.");
  return slug;
}

function requireSlugs(args: Args): string[] {
  const value = args.slugs;
  const slugs = Array.isArray(value)
    ? value.filter((s): s is string => typeof s === "string" && Boolean(s.trim()))
    : [];
  if (!slugs.length) throw new Error("This tool needs a non-empty `slugs` array.");
  return slugs;
}

async function callTool(ctx: Ctx, name: string, args: Args): Promise<unknown> {
  switch (name) {
    case "search_listings": {
      const limit = typeof args.limit === "number" ? args.limit : undefined;
      return ctx.runQuery(internal.mcp.search, {
        ...(str(args, "q") ? { q: str(args, "q")! } : {}),
        ...(str(args, "kind") ? { kind: str(args, "kind")! } : {}),
        ...(str(args, "category") ? { category: str(args, "category")! } : {}),
        ...(str(args, "react") ? { react: str(args, "react")! } : {}),
        ...(str(args, "styling") ? { styling: str(args, "styling")! } : {}),
        ...(str(args, "license") ? { license: str(args, "license")! } : {}),
        ...(limit !== undefined ? { limit } : {}),
      });
    }

    case "get_listing": {
      const slug = requireSlug(args);
      const found = await ctx.runQuery(internal.mcp.listing, { slug });
      if (!found) throw new Error(`No live listing with the slug "${slug}".`);
      return found;
    }

    case "get_component": {
      const slug = requireSlug(args);
      const found = await ctx.runQuery(internal.mcp.component, { slug });
      if (!found) throw new Error(`No component with the slug "${slug}".`);
      return found;
    }

    case "install_plan":
      return ctx.runQuery(internal.mcp.plan, {
        slugs: requireSlugs(args),
        ...(str(args, "name") ? { name: str(args, "name")! } : {}),
      });

    case "check_compatibility":
      return ctx.runQuery(internal.mcp.compatibility, {
        slugs: requireSlugs(args),
        ...(str(args, "react") ? { react: str(args, "react")! } : {}),
        ...(str(args, "styling") ? { styling: str(args, "styling")! } : {}),
        ...(typeof args.rsc === "boolean" ? { rsc: args.rsc } : {}),
      });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
