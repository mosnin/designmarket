"use client";

/**
 * Vendored from the smoothui registry:
 *   npx shadcn@latest add @smoothui/agent-avatar
 *
 * Local edits, kept to the minimum so a re-add is easy to re-apply:
 * this project compiles with `noUncheckedIndexedAccess`, under which every
 * `grid[y][x]` and `palette[i]` is `T | undefined` and the file does not
 * build. The grid is now a flat array walked with `.entries()`, and each cell
 * carries its colour instead of an index into the palette — both lookups
 * become total, with no non-null assertions. The RNG draw order is unchanged,
 * so every generated avatar is byte-identical to upstream.
 */

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export type AgentAvatarProps = Omit<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  "children"
> & {
  /** String seed to generate a unique deterministic avatar pattern */
  seed: string;
  /** Diameter in pixels */
  size?: number;
  /** Enable pixel animation (respects prefers-reduced-motion) */
  animated?: boolean;
};

const GRID_SIZE = 6;

/** Pulse: each pixel oscillates lightness independently */
const PULSE_SPEED = 0.002;
const PULSE_AMPLITUDE = 22;

/** Breathe: global slow scale oscillation */
const BREATHE_SPEED = 0.001;
const BREATHE_AMPLITUDE = 10;

/** Wave: diagonal sweep across the grid */
const WAVE_SPEED = 0.0015;
const WAVE_AMPLITUDE = 15;
const WAVE_LENGTH = 3;

/** Sparkle: random bright flashes */
const SPARKLE_SPEED = 0.004;
const SPARKLE_THRESHOLD = 0.92;
const SPARKLE_BOOST = 25;

/** Scale pulse: whole avatar breathes in size */
const SCALE_PULSE_SPEED = 0.0008;
const SCALE_PULSE_AMOUNT = 0.03;

/** Max hue spread from base — wider for richer color variation */
const HUE_SPREAD = 45;

const GLOW_RADIUS_RATIO = 0.25;

/** Simple deterministic hash from a string */
const hashSeed = (str: string): number => {
  let hash = 0;
  for (const char of str) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
};

/** Seeded PRNG (mulberry32) */
const createRng = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d_2b_79_f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

type HSL = [hue: number, saturation: number, lightness: number];

/** Derive a 3-color palette within the same hue family */
const generatePalette = (hash: number): [HSL, HSL, HSL] => {
  const rng = createRng(hash);
  const baseHue = rng() * 360;
  const sat = 75 + rng() * 20; // 75-95%

  return [
    [baseHue, sat, 55 + rng() * 10],
    [
      (baseHue - HUE_SPREAD + rng() * HUE_SPREAD * 2) % 360,
      sat - 5 + rng() * 10,
      40 + rng() * 15,
    ],
    [
      (baseHue - HUE_SPREAD + rng() * HUE_SPREAD * 2) % 360,
      sat - 10 + rng() * 15,
      60 + rng() * 15,
    ],
  ];
};

type Cell = {
  color: HSL;
  phase: number;
  brightness: number;
  sparklePhase: number;
};

/**
 * Build the grid, flat and in row-major order. Upstream drew four random
 * numbers per cell in this exact sequence — brightness, colour, phase,
 * sparkle — and object properties evaluate in source order, so keeping the
 * order keeps every avatar identical to the registry version.
 */
const generateGrid = (
  hash: number,
  palette: readonly [HSL, HSL, HSL]
): Cell[] => {
  const rng = createRng(hash + 1);
  const [first, second, third] = palette;
  // Same thirds as the original `Math.floor(rng() * 3)`, without an index.
  const pick = (r: number): HSL =>
    r < 1 / 3 ? first : r < 2 / 3 ? second : third;
  const grid: Cell[] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      grid.push({
        brightness: 0.3 + rng() * 0.7,
        color: pick(rng()),
        phase: rng() * Math.PI * 2,
        sparklePhase: rng() * Math.PI * 2,
      });
    }
  }

  return grid;
};

const AgentAvatar = ({
  seed,
  size = 64,
  animated = true,
  className,
  ...props
}: AgentAvatarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const hash = hashSeed(seed);
    const palette = generatePalette(hash);
    const grid = generateGrid(hash, palette);
    const cellSize = size / GRID_SIZE;
    const half = size / 2;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let shouldAnimate = animated && !motionQuery.matches;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, size, size);

      // Scale pulse — whole avatar breathes
      const scale = shouldAnimate
        ? 1 + Math.sin(time * SCALE_PULSE_SPEED) * SCALE_PULSE_AMOUNT
        : 1;

      ctx.save();
      ctx.translate(half, half);
      ctx.scale(scale, scale);
      ctx.translate(-half, -half);

      // Clip to circle
      ctx.beginPath();
      ctx.arc(half, half, half, 0, Math.PI * 2);
      ctx.clip();

      // Dark background
      ctx.fillStyle = "#08080f";
      ctx.fillRect(0, 0, size, size);

      // Global breathe offset for lightness
      const breatheOffset = shouldAnimate
        ? Math.sin(time * BREATHE_SPEED) * BREATHE_AMPLITUDE
        : 0;

      // Draw pixel grid. `entries()` yields a definite Cell, and row-major
      // order reproduces the original nested y/x walk.
      for (const [index, cell] of grid.entries()) {
        const x = index % GRID_SIZE;
        const y = Math.floor(index / GRID_SIZE);
        const [h, s, l] = cell.color;

        // Per-pixel pulse
        const pulse = shouldAnimate
          ? Math.sin(time * PULSE_SPEED + cell.phase) * PULSE_AMPLITUDE
          : 0;

        // Diagonal wave sweep
        const waveDist = (x + y) / WAVE_LENGTH;
        const wave = shouldAnimate
          ? Math.sin(time * WAVE_SPEED + waveDist) * WAVE_AMPLITUDE
          : 0;

        // Sparkle — occasional bright flash
        const sparkleVal = shouldAnimate
          ? Math.sin(time * SPARKLE_SPEED + cell.sparklePhase)
          : 0;
        const sparkle =
          sparkleVal > SPARKLE_THRESHOLD
            ? ((sparkleVal - SPARKLE_THRESHOLD) / (1 - SPARKLE_THRESHOLD)) *
              SPARKLE_BOOST
            : 0;

        const finalLight = Math.min(
          90,
          Math.max(
            20,
            (l + pulse + breatheOffset + wave + sparkle) * cell.brightness
          )
        );
        const finalSat = Math.min(100, s + 5);

        // Pixel glow — subtle shadow per cell
        ctx.shadowColor = `hsl(${h}, ${finalSat}%, ${finalLight}%)`;
        ctx.shadowBlur = cellSize * 0.45;

        ctx.fillStyle = `hsl(${h}, ${finalSat}%, ${finalLight}%)`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }

      // Reset shadow before restore
      ctx.shadowBlur = 0;
      ctx.restore();

      // Outer glow ring
      const [[gh, gs, gl]] = palette;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.shadowColor = `hsla(${gh}, ${gs}%, ${gl}%, 0.6)`;
      ctx.shadowBlur = size * GLOW_RADIUS_RATIO;
      ctx.beginPath();
      ctx.arc(half, half, half - 1, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${gh}, ${gs}%, ${gl}%, 0.15)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      if (shouldAnimate) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    const handleMotionChange = () => {
      cancelAnimationFrame(rafRef.current);
      shouldAnimate = animated && !motionQuery.matches;
      if (shouldAnimate) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        draw(0);
      }
    };

    motionQuery.addEventListener("change", handleMotionChange);

    if (shouldAnimate) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      draw(0);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [seed, size, animated]);

  return (
    <canvas
      aria-label={`Avatar for ${seed}`}
      className={cn("rounded-full", className)}
      ref={canvasRef}
      role="img"
      style={{ height: size, width: size }}
      {...props}
    />
  );
};

export default AgentAvatar;
