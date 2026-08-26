import type { ReactNode } from "react";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export default function HomePage(): ReactNode {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
        <LiveBadge />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        The feed lands in the next phase.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Badge variant="accent">Placeholder</Badge>
              <CardTitle className="mt-3">Card {i}</CardTitle>
              <CardDescription className="mt-1">
                Design system smoke test.
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
