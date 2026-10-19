"use client";
// Rolling-digit counter, like a car's odometer (inspired by the 21st.dev / Magic UI number tickers).
// Each digit is a column 0-9 that springs to its new position when the value changes.
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useReduced } from "@/lib/useReduced";

function Digit({ value, delay }: { value: number; delay: number }) {
  const reduce = useReduced();
  return (
    <span className="relative block h-[1.12em] overflow-hidden leading-[1.12em]" style={{ width: "1ch" }}>
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-value * 1.12}em` }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 18, mass: 0.9, delay }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="block h-[1.12em] text-center leading-[1.12em]">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function Odometer({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-5% 0px" });
  const chars = value.split("");
  // Index digits from the right so units stay in place when the length changes
  return (
    <span ref={ref} className={cn("tnum inline-flex items-end whitespace-nowrap leading-none", className)}>
      <span className="sr-only">{value}</span>
      {chars.map((c, i) => {
        const fromRight = chars.length - i;
        if (/\d/.test(c)) {
          return (
            <span key={`d${fromRight}`} aria-hidden="true">
              <Digit value={seen ? Number(c) : 0} delay={0.03 * i} />
            </span>
          );
        }
        return (
          <span key={`c${fromRight}-${c}`} aria-hidden="true" className="block h-[1.12em] leading-[1.12em]">
            {c === " " ? " " : c}
          </span>
        );
      })}
    </span>
  );
}
