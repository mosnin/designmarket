"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowLeft, GripVertical, Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PvButton, PvCard, PvMuted, PvStage, bool, num, str } from "./kit";
import type { RegistryKey } from "@/lib/registry-manifest";
import type { RegistryEntry } from "./types";

/**
 * Every entry here checks `useReducedMotion` and stops animating outright
 * rather than animating less. A preview that ignores the viewer's OS setting
 * would be a poor advertisement for a library we grade on accessibility.
 */

const SPRINGS = {
  gentle: { type: "spring" as const, stiffness: 180, damping: 26 },
  snappy: { type: "spring" as const, stiffness: 420, damping: 34 },
  bouncy: { type: "spring" as const, stiffness: 500, damping: 18 },
};

const ITEMS = [
  "Radix Primitives",
  "TanStack Table",
  "Recharts",
  "Motion",
  "cmdk",
  "Zustand",
  "React Hook Form",
];

const LOGOS = [
  "shadcn/ui", "Radix", "Mantine", "Chakra", "MUI", "HeroUI",
  "daisyUI", "Ark UI", "Base UI", "Tremor",
];

export const motionRegistry = {
  "motion/layout-list": {
    height: 340,
    usage: `<AnimatePresence>
  {items.map((item) => (
    <motion.li key={item} layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}>
      {item}
    </motion.li>
  ))}
</AnimatePresence>`,
    render: (p) => <LayoutList props={p} />,
  },

  "motion/shared-element": {
    height: 340,
    usage: `<motion.div layoutId={\`card-\${id}\`}>
  <motion.h3 layoutId={\`title-\${id}\`}>{title}</motion.h3>
</motion.div>`,
    render: (p) => <SharedElement props={p} />,
  },

  "magic/marquee": {
    height: 190,
    usage: `<Marquee pauseOnHover className="[--duration:28s]">
  {logos.map((logo) => <LogoCard key={logo} name={logo} />)}
</Marquee>`,
    render: (p) => {
      const reversed = str(p, "direction", "left") === "right";
      const duration = { slow: "44s", normal: "28s", fast: "16s" }[
        str(p, "speed", "normal")
      ] ?? "28s";
      const pause = bool(p, "pauseOnHover", true);

      return (
        <div className="group relative w-full overflow-hidden">
          <div
            className={cn(
              "flex w-max gap-3 motion-reduce:animate-none",
              pause && "group-hover:[animation-play-state:paused]"
            )}
            style={{
              animation: `pv-marquee-${reversed ? "right" : "left"} ${duration} linear infinite`,
            }}
          >
            {[...LOGOS, ...LOGOS].map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                className="flex h-14 w-36 shrink-0 items-center justify-center rounded-pv border border-pv-border bg-pv-card text-[13px] font-medium text-pv-card-foreground"
              >
                {logo}
              </div>
            ))}
          </div>
          {/* Edge fades, so the loop never shows a hard seam. */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-pv-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-pv-background to-transparent" />
        </div>
      );
    },
  },

  "magic/number-ticker": {
    height: 170,
    usage: `<NumberTicker value={12480} decimals={0} />`,
    render: (p) => (
      <NumberTicker
        value={num(p, "value", 12480)}
        decimals={Math.max(0, Math.min(2, num(p, "decimals", 0)))}
      />
    ),
  },

  "magic/grid-pattern": {
    height: 260,
    usage: `<AnimatedGridPattern numSquares={30} maxOpacity={0.1} duration={3} />`,
    render: (p) => {
      const size = { sparse: 44, normal: 30, dense: 20 }[str(p, "density", "normal")] ?? 30;
      const animate = bool(p, "animate", true);
      const cells = Array.from({ length: 26 }, (_, i) => i);
      return (
        <div className="relative h-56 w-full overflow-hidden rounded-pv border border-pv-border bg-pv-card">
          <svg className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <pattern id="pv-grid" width={size} height={size} patternUnits="userSpaceOnUse">
                <path
                  d={`M ${size} 0 L 0 0 0 ${size}`}
                  fill="none"
                  stroke="var(--pv-border)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pv-grid)" />
            {animate
              ? cells.map((i) => (
                  <rect
                    key={i}
                    width={size - 1}
                    height={size - 1}
                    x={((i * 7) % 14) * size + 1}
                    y={((i * 3) % 6) * size + 1}
                    fill="var(--pv-primary)"
                    opacity={0}
                    className="motion-reduce:hidden"
                    style={{
                      animation: `pv-cell-pulse ${3 + (i % 5) * 0.7}s ease-in-out ${(i % 9) * 0.4}s infinite`,
                      opacity: 0.12,
                    }}
                  />
                ))
              : null}
          </svg>
          <div className="relative flex h-full items-center justify-center">
            <p className="text-center text-[13px] text-pv-muted-foreground">
              Decorative backdrop — one SVG pattern, no per-frame JavaScript.
            </p>
          </div>
        </div>
      );
    },
  },

  "mp/text-shimmer": {
    height: 160,
    usage: `<TextShimmer duration={2} className="text-lg">
  Reading the registry…
</TextShimmer>`,
    render: (p) => {
      const duration = Math.max(0.6, num(p, "duration", 2));
      const size = { sm: "text-sm", base: "text-base", lg: "text-xl", xl: "text-3xl" }[
        str(p, "size", "lg")
      ] ?? "text-xl";
      return (
        <PvStage className="flex-col gap-3">
          <span
            className={cn("font-medium motion-reduce:animate-none", size)}
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--pv-muted-foreground) 30%, var(--pv-foreground) 50%, var(--pv-muted-foreground) 70%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              animation: `pv-text-shimmer ${duration}s linear infinite`,
            }}
          >
            Reading the registry…
          </span>
          <PvMuted className="text-[11px]">
            background-clip, not an overlay — the text stays selectable.
          </PvMuted>
        </PvStage>
      );
    },
  },

  "mp/cursor": {
    height: 260,
    usage: `<Cursor variant="ring">
  <motion.div className="pointer-events-none" />
</Cursor>`,
    render: (p) => <FollowerCursor variant={str(p, "variant", "ring")} />,
  },
} satisfies Partial<Record<RegistryKey, RegistryEntry>>;

/* ---------------------------------------------------------------- helpers */

function LayoutList({ props }: { props: Record<string, unknown> }): ReactNode {
  const reduced = useReducedMotion();
  const count = Math.max(2, Math.min(ITEMS.length, num(props, "items", 5)));
  const spring = SPRINGS[str(props, "spring", "snappy") as keyof typeof SPRINGS] ?? SPRINGS.snappy;
  const [items, setItems] = useState(() => ITEMS.slice(0, count));

  return (
    <div className="w-full max-w-sm">
      <div className="mb-3 flex gap-2">
        <PvButton
          size="sm"
          onClick={() =>
            setItems((current) => {
              const next = ITEMS.find((i) => !current.includes(i));
              return next ? [next, ...current] : current;
            })
          }
        >
          <Plus />
          Add
        </PvButton>
        <PvButton
          size="sm"
          variant="outline"
          onClick={() => setItems((current) => [...current].reverse())}
        >
          Reverse
        </PvButton>
      </div>
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={reduced ? { duration: 0.01 } : spring}
              className="flex items-center gap-2 rounded-pv border border-pv-border bg-pv-card px-3 py-2 text-[13px] text-pv-card-foreground"
            >
              <GripVertical className="size-3.5 shrink-0 text-pv-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{item}</span>
              <button
                onClick={() => setItems((c) => c.filter((i) => i !== item))}
                aria-label={`Remove ${item}`}
                className="shrink-0 text-pv-muted-foreground hover:text-pv-destructive"
              >
                <X className="size-3.5" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function SharedElement({ props }: { props: Record<string, unknown> }): ReactNode {
  const reduced = useReducedMotion();
  const duration = Math.max(0.15, num(props, "duration", 0.4));
  const [open, setOpen] = useState<string | null>(null);
  const cards = [
    { id: "radix", title: "Radix Primitives", blurb: "Unstyled, accessible behaviour." },
    { id: "motion", title: "Motion", blurb: "Layout animations that survive reflow." },
  ];

  return (
    <div className="relative w-full max-w-md">
      {open === null ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              layoutId={reduced ? undefined : `pv-card-${card.id}`}
              onClick={() => setOpen(card.id)}
              transition={{ duration }}
              className="rounded-pv border border-pv-border bg-pv-card p-4 text-left text-pv-card-foreground"
            >
              <motion.h3
                layoutId={reduced ? undefined : `pv-title-${card.id}`}
                className="text-sm font-semibold"
              >
                {card.title}
              </motion.h3>
              <PvMuted className="mt-1 text-[12px]">{card.blurb}</PvMuted>
            </motion.button>
          ))}
        </div>
      ) : (
        <motion.div
          layoutId={reduced ? undefined : `pv-card-${open}`}
          transition={{ duration }}
          className="rounded-pv border border-pv-border bg-pv-card p-5 text-pv-card-foreground"
        >
          <button
            onClick={() => setOpen(null)}
            className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-pv-muted-foreground hover:text-pv-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </button>
          <motion.h3
            layoutId={reduced ? undefined : `pv-title-${open}`}
            className="text-lg font-semibold"
          >
            {cards.find((c) => c.id === open)?.title}
          </motion.h3>
          <PvMuted className="mt-2 leading-relaxed">
            The same DOM node moved and resized — it was never unmounted and
            remounted, which is why text does not flash.
          </PvMuted>
        </motion.div>
      )}
    </div>
  );
}

function NumberTicker({
  value,
  decimals,
}: {
  value: number;
  decimals: number;
}): ReactNode {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20px" });
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced || !inView) return;
    let frame = 0;
    const start = performance.now();
    const durationMs = 1200;
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutExpo, so it decelerates into the final value.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setShown(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, value]);

  return (
    <PvStage className="flex-col gap-2">
      {/* The true value is always in the accessibility tree; only the visual
          digits animate. */}
      <span className="sr-only">{value.toLocaleString()}</span>
      <span
        ref={ref}
        aria-hidden
        className="font-mono text-4xl font-semibold tabular-nums text-pv-foreground"
      >
        {shown.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
      </span>
      <PvMuted>components indexed</PvMuted>
    </PvStage>
  );
}

function FollowerCursor({ variant }: { variant: string }): ReactNode {
  const reduced = useReducedMotion();
  const areaRef = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [hot, setHot] = useState(false);

  return (
    <div
      ref={areaRef}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        const rect = areaRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPoint({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }}
      onPointerLeave={() => setPoint(null)}
      className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-pv border border-dashed border-pv-border md:cursor-none"
    >
      <PvCard
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        className="px-5 py-3 text-[13px] font-medium"
      >
        Hover me
      </PvCard>

      {point && !reduced ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 hidden md:block"
          animate={{ x: point.x, y: point.y }}
          transition={{ type: "spring", stiffness: 600, damping: 34, mass: 0.35 }}
        >
          {variant === "dot" ? (
            <span className="block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pv-primary" />
          ) : variant === "label" ? (
            <span className="block -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full bg-pv-primary px-2 py-0.5 text-[11px] font-medium text-pv-primary-foreground">
              {hot ? "open" : "explore"}
            </span>
          ) : (
            <span
              className={cn(
                "block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-pv-primary transition-all duration-200",
                hot ? "size-10 bg-pv-primary/10" : "size-5"
              )}
            />
          )}
        </motion.div>
      ) : null}

      <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] text-pv-muted-foreground">
        Decorative and pointer-only — hidden from assistive tech and on touch.
      </p>
    </div>
  );
}
