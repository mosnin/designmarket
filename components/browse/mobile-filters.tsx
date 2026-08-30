"use client";

import { Icon } from "@/components/icon";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function MobileFilters({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}): ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Icon name="filter" />
        Filters
        {activeCount > 0 ? (
          <Badge variant="solid" size="sm">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] max-w-md overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>Works with</DialogTitle>
          </DialogHeader>
          <div onClick={() => setOpen(false)}>{children}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
