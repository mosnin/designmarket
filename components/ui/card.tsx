import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">): ReactNode {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-muted/50 text-foreground ",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">): ReactNode {
  return <div className={cn("flex flex-col gap-1 p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">): ReactNode {
  return (
    <h3 className={cn("font-serif text-base font-medium leading-tight", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">): ReactNode {
  return (
    <p className={cn("text-[13px] leading-relaxed text-muted-foreground", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">): ReactNode {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">): ReactNode {
  return (
    <div className={cn("flex items-center gap-2 p-4 pt-0", className)} {...props} />
  );
}
