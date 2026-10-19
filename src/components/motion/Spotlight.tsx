"use client";
// Soft beams of light behind the hero (inspired by Aceternity "Spotlight" / Magic UI "Light Rays").
import { motion } from "framer-motion";
import { useReduced } from "@/lib/useReduced";

export function Spotlight() {
  const reduce = useReduced();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="dot-grid absolute inset-0" />
      <motion.div
        className="absolute -top-[30%] left-[-10%] h-[900px] w-[900px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(76,141,255,0.22), transparent)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ opacity: { duration: 1.6 }, scale: { duration: 1.6 }, x: { duration: 18, repeat: Infinity, ease: "easeInOut" }, y: { duration: 22, repeat: Infinity, ease: "easeInOut" } }}
      />
      <motion.div
        className="absolute right-[-15%] top-[10%] h-[700px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(226,93,44,0.14), transparent)" }}
        initial={{ opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ opacity: { duration: 2, delay: 0.4 }, x: { duration: 20, repeat: Infinity, ease: "easeInOut" }, y: { duration: 16, repeat: Infinity, ease: "easeInOut" } }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-900" />
    </div>
  );
}
