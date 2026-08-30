import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { IconTile } from "@/components/surface/icon-tile";
import { SectionHeading } from "@/components/surface/section-heading";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { api } from "@/convex/_generated/api";
import { AUTH_ENABLED } from "@/lib/auth-server";
import { pageMetadata } from "@/lib/metadata";
import { sectionForKind } from "@/lib/taxonomy";
import { formatDate, timeAgo } from "@/lib/utils";

type Profile = Awaited<ReturnType<typeof loadProfile>>;

/**
 * Profiles only exist when there is a backend. On a seed-only deployment the
 * page says so rather than 404-ing, because "this build has no accounts" and
 * "no such person" are different facts and the difference matters to whoever
 * is evaluating the repo.
 */
async function loadProfile(handle: string) {
  if (!AUTH_ENABLED) return null;
  try {
    return await fetchQuery(api.profiles.publicProfile, { handle });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await loadProfile(handle);
  return pageMetadata({
    title: profile ? `${profile.displayName} (@${profile.handle})` : `@${handle}`,
    description: profile?.bio ?? `Listings and boards from @${handle}.`,
    path: `/u/${handle}`,
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<ReactNode> {
  const { handle } = await params;

  if (!AUTH_ENABLED) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
        <h1 className="font-serif text-[22px] font-medium">
          Profiles need a backend
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          This deployment is running on the bundled catalogue, which has no
          accounts in it. Everything else — search, categories, live component
          rendering — works exactly the same.
        </p>
        <Link
          href="/explore"
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-foreground underline underline-offset-4"
        >
          Back to the index
          <Icon name="forward" size={13} />
        </Link>
      </div>
    );
  }

  const profile = await loadProfile(handle);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-[72rem] px-5 py-10 sm:px-8">
      <ProfileHeader profile={profile} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <SectionHeading
            title={`Submitted ${profile.listings.length === 1 ? "listing" : "listings"}`}
            aside={
              <span className="text-[13px] text-foreground/50">
                {profile.listings.length}
              </span>
            }
          />
          {profile.listings.length ? (
            <ul className="flex flex-col gap-1">
              {profile.listings.map((listing) => (
                <li key={listing.slug}>
                  <Link
                    href={`${sectionForKind(listing.kind)?.href ?? "/explore"}/${listing.slug}`}
                    className="t-press flex items-center gap-3 rounded-sm px-2 py-2.5 hover:bg-muted/50"
                  >
                    <IconTile monogram={listing.monogram} color={listing.color} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">
                        {listing.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
                        {listing.tagline}
                      </span>
                    </span>
                    <Icon
                      name="forward"
                      size={14}
                      className="text-foreground/50"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              Nothing published yet.
            </p>
          )}
        </div>

        <aside>
          <SectionHeading
            title="Public boards"
            aside={
              <span className="text-[13px] text-foreground/50">
                {profile.boards.length}
              </span>
            }
          />
          {profile.boards.length ? (
            <ul className="flex flex-col gap-2">
              {profile.boards.map((board) => (
                <li
                  key={board.slug}
                  className="rounded-sm border border-border bg-muted/50 p-3.5 dark:border-transparent"
                >
                  <p className="text-[14px] font-medium">{board.name}</p>
                  {board.description ? (
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {board.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[11px] text-foreground/50">
                    {board.itemCount} items · {timeAgo(board.updatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              No public boards.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function ProfileHeader({ profile }: { profile: NonNullable<Profile> }): ReactNode {
  return (
    <header className="flex flex-wrap items-start gap-4">
      {/* This header used to draw initials on a fixed gradient and never read
          `avatarUrl` at all, so a member who had set a photo still saw two
          letters on their own profile. */}
      <UserAvatar
        seed={profile.handle}
        src={profile.avatarUrl}
        size={64}
        // The one avatar on the page, and the largest — worth the frame loop.
        animated
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-[26px] font-medium">
            {profile.displayName}
          </h1>
          {profile.plan === "pro" ? (
            <Badge variant="accent" size="sm">
              Pro
            </Badge>
          ) : null}
        </div>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          @{profile.handle} · joined {formatDate(profile.createdAt)}
        </p>
        {profile.bio ? (
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        ) : null}
        {profile.website ? (
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-foreground underline underline-offset-4"
          >
            {profile.website.replace(/^https?:\/\//, "")}
            <Icon name="external" size={12} />
          </a>
        ) : null}
      </div>
    </header>
  );
}
