"use client";
// Words light up one by one as you scroll past (inspired by Magic UI "Text Reveal").
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useReduced } from "@/lib/useReduced";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

export function ScrollTextReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <div ref={ref}>
      {reduce ? (
        <p className={className}>{text}</p>
      ) : (
      <p className={className} aria-label={text}>
        <span aria-hidden="true">
          {words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </span>
      </p>
      )}
    </div>
  );
}
