"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1 },
};

export const stagger = (staggerChildren = 0.04): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren } },
});

/**
 * Scroll-triggered reveal. Collapses to a plain div when the user has asked
 * for reduced motion, rather than animating "a little bit less".
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variants = fadeInUp,
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
      viewport={{ once, margin: "-64px" }}
      variants={variants}
      transition={{ duration: 0.5, ease: easeOutExpo, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({
  children,
  className,
  step = 0.04,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
}): ReactNode {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={stagger(step)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactNode {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      transition={{ duration: 0.4, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}
