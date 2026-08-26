"use client";

import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * The theme's stat band: muted ground, serif numerals at display size, one
 * line of support underneath. Counting up on scroll is the theme's behaviour.
 *
 * The figures passed in are counts of what this catalogue actually holds. A
 * marketing number that isn't a real count is the same lie as an invented
 * download figure, so these are computed, never written.
 */
export function Stats({
  items,
}: {
  items: { value: number; suffix?: string; label: string }[];
}): ReactNode {
  return (
    <section className="relative w-full overflow-hidden bg-muted py-16 sm:py-20">
      <div className="relative mx-auto max-w-270 px-6 sm:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-2 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                <Counter to={item.value} />
                {item.suffix}
              </div>
              <p className="text-sm text-foreground/70 sm:text-base">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ to }: { to: number }): ReactNode {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const value = useMotionValue(0);
  const spring = useSpring(value, { duration: 1400, bounce: 0 });

  useEffect(() => {
    if (inView) value.set(to);
  }, [inView, to, value]);

  useEffect(
    () =>
      spring.on("change", (latest: number) => {
        if (ref.current) ref.current.textContent = Math.round(latest).toLocaleString();
      }),
    [spring]
  );

  // Rendered with the final value so it is correct before hydration, and for
  // anyone who never scrolls it into view.
  return (
    <span ref={ref} className="tabular-nums">
      {to.toLocaleString()}
    </span>
  );
}
