"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The theme's accordion: a `foreground/10` rule between rows, a plus that
 * rotates into a minus, and generous vertical rhythm. No card, no fill, no
 * chevron in a circle.
 */
export function FAQ({
  items,
}: {
  items: { question: string; answer: string }[];
}): ReactNode {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-foreground/10">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question} className="border-b border-foreground/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="group flex w-full cursor-pointer items-center justify-between py-6 text-left"
            >
              <span className="pr-8 text-base font-medium text-foreground sm:text-lg">
                {item.question}
              </span>
              <span className="flex size-6 shrink-0 items-center justify-center">
                <Icon
                  name={isOpen ? "minus" : "plus"}
                  size={20}
                  className="text-foreground/60 transition-colors group-hover:text-foreground"
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 leading-relaxed text-foreground/60">
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
