"use client";
// Page transition: each new page fades and lifts in.
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReduced } from "@/lib/useReduced";

export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReduced();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none", transform: "none" } }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
