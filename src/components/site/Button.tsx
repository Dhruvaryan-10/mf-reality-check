import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "shimmer";

const styles: Record<Variant, string> = {
  primary: "bg-fg text-ink-900 hover:bg-white",
  ghost: "border border-line text-fg hover:border-white/30 hover:bg-white/[0.04]",
  // Inspired by Magic UI "Shimmer Button": a band of light sweeps across
  shimmer:
    "text-white border border-white/10 bg-[linear-gradient(110deg,#1d4ed8,45%,#7aa7ff,55%,#1d4ed8)] bg-[length:200%_100%] animate-shimmer shadow-[0_0_40px_-8px_rgba(76,141,255,0.7)]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.95rem] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={cn(base, styles[variant], className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    // Member pages depend on sign-in state, so don't prefetch them
    <Link href={href} prefetch={/^\/(dashboard|compare)/.test(href) ? false : undefined} className={cn(base, styles[variant], className)}>
      {children}
    </Link>
  );
}
