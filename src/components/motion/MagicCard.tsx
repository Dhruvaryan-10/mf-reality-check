"use client";
// A card whose border and surface light up where the pointer is
// (inspired by Magic UI "Magic Card" / Aceternity "Card Spotlight").
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function MagicCard({ children, className, glow = "76,141,255" }: { children: ReactNode; className?: string; glow?: string }) {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const border = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, rgba(${glow},0.55), transparent 70%)`;
  const surface = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, rgba(${glow},0.09), transparent 70%)`;

  return (
    <div
      className={cn("group relative rounded-2xl p-px", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        x.set(-400);
        y.set(-400);
      }}
    >
      <div className="absolute inset-0 rounded-2xl bg-white/[0.07]" aria-hidden="true" />
      <motion.div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: border }} aria-hidden="true" />
      <div className="relative h-full rounded-[15px] bg-ink-850">
        <motion.div className="pointer-events-none absolute inset-0 rounded-[15px]" style={{ background: surface }} aria-hidden="true" />
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
}
