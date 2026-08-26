import { ArrowUpDown, Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SORTS, setParamHref, type SearchParamsInput } from "@/lib/search-params";
import type { SortKey } from "@/lib/types";

export function SortMenu({
  pathname,
  params,
  current = "trending",
}: {
  pathname: string;
  params: SearchParamsInput;
  current?: SortKey;
}): ReactNode {
  const active = SORTS.find((s) => s.value === current) ?? SORTS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown />
          <span className="hidden sm:inline">{active.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {SORTS.map((sort) => (
          <DropdownMenuItem key={sort.value} asChild>
            <Link
              href={setParamHref(
                pathname,
                params,
                "sort",
                sort.value === "trending" ? null : sort.value
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{sort.label}</span>
                <span className="truncate text-[11px] text-subtle-foreground">
                  {sort.hint}
                </span>
              </span>
              {sort.value === current ? (
                <Check className="size-4 shrink-0 !text-accent" />
              ) : null}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
