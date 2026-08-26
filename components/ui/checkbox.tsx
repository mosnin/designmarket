"use client";

import { Icon } from "@/components/icon";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>): ReactNode {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-foreground/20 bg-muted/50 transition-colors",
        "data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background",
        "data-[state=indeterminate]:border-foreground data-[state=indeterminate]:bg-foreground data-[state=indeterminate]:text-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === "indeterminate" ? (
          <Icon name="minus" className="size-3" strokeWidth={3} />
        ) : (
          <Icon name="check" className="size-3" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
