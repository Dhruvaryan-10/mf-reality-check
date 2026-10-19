// An endless ticker strip (inspired by Magic UI "Marquee"). Pauses on hover.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("group relative flex overflow-hidden", className)}
      style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
    >
      <div className="flex w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
