import { Icon } from "@/components/icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { pageHref, type SearchParamsInput } from "@/lib/search-params";
import { cn } from "@/lib/utils";

export function Pagination({
  pathname,
  params,
  page,
  total,
  limit,
}: {
  pathname: string;
  params: SearchParamsInput;
  page: number;
  total: number;
  limit: number;
}): ReactNode {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;

  const window = 2;
  const numbers: (number | "gap")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= window) numbers.push(i);
    else if (numbers[numbers.length - 1] !== "gap") numbers.push("gap");
  }

  const base =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-sm border px-2 text-[13px] transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      <Link
        href={pageHref(pathname, params, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          base,
          "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
          page === 1 && "pointer-events-none opacity-40"
        )}
        aria-label="Previous page"
      >
        <Icon name="back" className="size-4" />
      </Link>

      {numbers.map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-foreground/50">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={pageHref(pathname, params, n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              base,
              n === page
                ? "border-foreground bg-foreground font-medium text-background"
                : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {n}
          </Link>
        )
      )}

      <Link
        href={pageHref(pathname, params, Math.min(pages, page + 1))}
        aria-disabled={page === pages}
        className={cn(
          base,
          "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
          page === pages && "pointer-events-none opacity-40"
        )}
        aria-label="Next page"
      >
        <Icon name="forward" className="size-4" />
      </Link>
    </nav>
  );
}
