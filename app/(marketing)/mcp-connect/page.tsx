import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { CodeBlock } from "@/components/preview/code-panel";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = pageMetadata({
  title: "Connect the MCP server",
  description:
    "Point Claude Code, Cursor or any MCP client at the index so your agent can search, resolve install plans and check compatibility.",
  path: "/mcp-connect",
});

/**
 * The endpoint is derived from the configured Convex deployment rather than
 * hardcoded, so this page is correct on a fork, a preview deployment and
 * production without anyone remembering to edit it.
 */
function endpoint(): string {
  const convex = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convex) return "https://<your-deployment>.convex.site/mcp";
  return `${convex.replace(".convex.cloud", ".convex.site")}/mcp`;
}

export default function ConnectPage(): ReactNode {
  const url = endpoint();

  return (
    <div className="mx-auto max-w-[52rem] px-5 py-14 sm:px-8">
      <h1 className="font-serif text-[30px] font-medium leading-tight">
        Connect the MCP server
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        One HTTP endpoint speaking JSON-RPC. Any MCP client can reach it —
        below are the three most people use. You&apos;ll need a key from{" "}
        <Link href="/me/settings" className="text-foreground underline underline-offset-4">
          settings
        </Link>
        .
      </p>

      <Step n={1} title="Claude Code">
        <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
          One command, from anywhere in your project.
        </p>
        <CodeBlock
          language="bash"
          filename="terminal"
          code={`claude mcp add --transport http vitrine ${url} \\
  --header "Authorization: Bearer vtr_your_key_here"`}
        />
      </Step>

      <Step n={2} title="Cursor, Windsurf, Zed">
        <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
          These read an <code className="font-mono text-[12px]">mcp.json</code>.
          Drop this into the servers block.
        </p>
        <CodeBlock
          language="json"
          filename="mcp.json"
          code={JSON.stringify(
            {
              mcpServers: {
                vitrine: {
                  type: "http",
                  url,
                  headers: { Authorization: "Bearer vtr_your_key_here" },
                },
              },
            },
            null,
            2
          )}
        />
      </Step>

      <Step n={3} title="Anything else">
        <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
          It&apos;s a plain POST. If your client can send JSON with a header,
          it can talk to this.
        </p>
        <CodeBlock
          language="bash"
          filename="terminal"
          code={`curl -s ${url} \\
  -H "Authorization: Bearer vtr_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}
        />
      </Step>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-[17px] font-semibold tracking-tight">
          Try it with one question
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          Once it&apos;s connected, the thing worth asking isn&apos;t
          &ldquo;find me a component library&rdquo;. It&apos;s the question you
          would otherwise spend an afternoon on:
        </p>
        <blockquote className="mt-4 border-l-2 border-accent pl-4 text-[15px] leading-relaxed">
          &ldquo;I&apos;m on React 19 with Tailwind and Server Components. Find
          me a headless table and a date picker that both work here, check they
          don&apos;t conflict, and give me the install commands.&rdquo;
        </blockquote>
        <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
          That&apos;s three tool calls — <code className="font-mono">search_listings</code>{" "}
          twice, <code className="font-mono">check_compatibility</code> once,{" "}
          <code className="font-mono">install_plan</code> to finish. Every
          number in the answer was fetched from GitHub or npm; anything we
          couldn&apos;t verify comes back absent rather than as a zero.
        </p>
      </section>

      <p className="mt-10 text-[13px] text-foreground/50">
        Keys are scoped to read and rate-limited per account. Revoking one in{" "}
        <Link href="/me/settings" className="text-foreground underline underline-offset-4">
          settings
        </Link>{" "}
        takes effect on the next call.{" "}
        <a
          href={siteConfig.github}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-foreground hover:underline"
        >
          Source
          <Icon name="external" size={11} />
        </a>
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <section className="mt-10">
      <h2 className="mb-3 flex items-baseline gap-2.5 text-[17px] font-semibold tracking-tight">
        <span className="font-mono text-[13px] text-foreground/50">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
