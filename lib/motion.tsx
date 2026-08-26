"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

/**
 * MOTION
 *
 * Every value here comes from the transitions.dev scale that also lives in
 * `globals.css`, so a CSS transition and a Motion animation on the same
 * element agree. Nothing in the product invents its own curve.
 *
 * The rule for reduced motion is absolute: we do not animate less, we do not
 * animate at all. A component that "respects" the setting by halving its
 * duration is still moving.
 */

export const EASE = {
  smoothOut: [0.22, 1, 0.36, 1] as const,
  bounce: [0.34, 1.36, 0.64, 1] as const,
  bounceStrong: [0.34, 3.85, 0.64, 1] as const,
};

export const DURATION = {
  micro: 0.08,
  quick: 0.15,
  fast: 0.25,
  medium: 0.35,
  slow: 0.4,
  verySlow: 0.5,
  stagger: 0.04,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** The house entrance: a short rise out of a 2px blur. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DURATION.slow, ease: EASE.smoothOut },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASE.bounce },
  },
};

export const stagger = (step = DURATION.stagger): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step } },
});

/** Scroll-triggered reveal. Renders a plain div under reduced motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  variants = riseIn,
  once = true,
  ...props
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  once?: boolean;
} & Omit<ComponentProps<typeof motion.div>, "variants">): ReactNode {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={variants}
      transition={{ duration: DURATION.slow, ease: EASE.smoothOut, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** A list whose children arrive one after another as it scrolls in. */
export function StaggerList({
  children,
  className,
  step = DURATION.stagger,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  once?: boolean;
}): ReactNode {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      variants={stagger(step)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variants = riseIn,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}): ReactNode {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
