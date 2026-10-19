"use client";
// Tabs / toggles with a pill that glides between options (inspired by Aceternity "Animated Tabs").
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface Option<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  id,
  label,
  size = "md",
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  /** unique per page, so pills don't fly between different controls */
  id: string;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("inline-flex rounded-full border border-line bg-white/[0.03] p-1", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative rounded-full font-medium transition-colors",
              size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-[0.95rem]",
              on ? "text-ink-900" : "text-fg-2 hover:text-fg"
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-fg"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative whitespace-nowrap">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
