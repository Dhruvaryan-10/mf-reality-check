"use client";
// Buttery smooth scrolling (Lenis), switched off for people who prefer reduced motion.
import { ReactLenis } from "lenis/react";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { useReduced } from "@/lib/useReduced";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReduced();
  // reducedMotion="user": people who ask for less motion get fades instead of movement
  return (
    <MotionConfig reducedMotion="user">
      {reduce ? (
        children
      ) : (
        <ReactLenis root options={{ lerp: 0.11, smoothWheel: true }}>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
