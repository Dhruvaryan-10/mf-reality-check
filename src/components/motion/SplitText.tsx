"use client";
// Headline that rises in word by word (inspired by React Bits "Split Text" / Aceternity "Text Generate").
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReduced } from "@/lib/useReduced";

interface Props {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "p";
  /** animate when scrolled into view instead of on page load */
  inView?: boolean;
}

export function SplitText({ text, className, delay = 0, as = "h1", inView = false }: Props) {
  const reduce = useReduced();
  const Tag = motion[as];
  const words = text.split(" ");
  const trigger = inView ? { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } } : { animate: "show" };
  return (
    <Tag
      className={cn(className)}
      initial={reduce ? false : "hidden"}
      {...trigger}
      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "105%", opacity: 0, filter: "blur(6px)" },
              show: { y: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
