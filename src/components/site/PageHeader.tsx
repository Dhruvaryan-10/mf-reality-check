import type { ReactNode } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";

export function PageHeader({ title, lede, children }: { title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative mx-auto max-w-page px-5 pb-10 pt-36 sm:px-8 sm:pt-44">
      <div className="dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <SplitText text={title} className="max-w-4xl font-display text-[clamp(2.4rem,6vw,4.6rem)] font-semibold leading-[1.02]" />
      {lede && (
        <Reveal delay={0.35}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-2 sm:text-xl">{lede}</p>
        </Reveal>
      )}
      {children && <Reveal delay={0.5}>{children}</Reveal>}
    </header>
  );
}

export function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-page px-5 py-16 sm:px-8 sm:py-24 ${className}`}>
      {children}
    </section>
  );
}
