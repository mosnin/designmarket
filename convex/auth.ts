import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/**
 * Two ways in, deliberately.
 *
 * GitHub because the audience already has an account there and it gives us a
 * verified handle and avatar for free. Password because a marketplace people
 * are meant to browse logged out should not make an OAuth grant the price of
 * saving a bookmark.
 *
 * Everything after account creation — the profile row, the handle, the
 * first-user-is-admin bootstrap — happens in `profiles.ensureForUser`, so
 * there is exactly one place that decides what a new account looks like.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub,
    Password({
      profile(params) {
        const name = typeof params.name === "string" ? params.name.trim() : "";
        return {
          email: params.email as string,
          ...(name ? { name } : {}),
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      // Sign-ins to an existing account already have a profile.
      if (existingUserId) return;
      await ctx.runMutation(internal.profiles.ensureForUser, { userId });
    },
  },
});
