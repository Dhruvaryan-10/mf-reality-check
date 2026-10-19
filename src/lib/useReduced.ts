"use client";
// Like framer-motion's useReducedMotion, but always `false` on the first render so the
// server HTML and the first client render match (no hydration errors), then updates.
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function useReduced() {
  const prefers = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? Boolean(prefers) : false;
}
