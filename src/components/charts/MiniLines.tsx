"use client";
// Small multi-line SVG chart that draws itself in. Used for the Learn page visuals.
import { motion } from "framer-motion";
import { useReduced } from "@/lib/useReduced";

export interface MiniSeries {
  values: number[];
  color: string;
  dashed?: boolean;
  area?: boolean;
  label?: string;
}

export function MiniLines({
  series,
  height = 260,
  min,
  max,
  zeroLine = false,
  yLabels,
}: {
  series: MiniSeries[];
  height?: number;
  min?: number;
  max?: number;
  zeroLine?: boolean;
  yLabels?: { value: number; label: string }[];
}) {
  const reduce = useReduced();
  const W = 520;
  const H = height;
  const L = yLabels ? 52 : 6;
  const all = series.flatMap((s) => s.values);
  const lo = min ?? Math.min(...all);
  const hi = max ?? Math.max(...all);
  const x = (i: number, n: number) => L + (i / (n - 1)) * (W - L - 6);
  const y = (v: number) => H - 8 - ((v - lo) / (hi - lo || 1)) * (H - 16);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" aria-hidden="true">
      {yLabels?.map((t) => (
        <g key={t.label}>
          <line x1={L} x2={W} y1={y(t.value)} y2={y(t.value)} stroke="rgba(148,163,184,0.12)" />
          <text x={L - 8} y={y(t.value) + 4} textAnchor="end" fontSize="12" fill="#717c95">
            {t.label}
          </text>
        </g>
      ))}
      {zeroLine && <line x1={L} x2={W} y1={y(0)} y2={y(0)} stroke="rgba(232,236,244,0.3)" />}
      {series.map((s, k) => {
        const n = s.values.length;
        const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i, n).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
        const base = zeroLine ? y(0) : H;
        return (
          <g key={k}>
            {s.area && (
              <motion.path
                d={`${d} L${x(n - 1, n)},${base} L${x(0, n)},${base} Z`}
                fill={s.color}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 0.16 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            )}
            <motion.path
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={2.2}
              strokeDasharray={s.dashed ? "5 5" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: k * 0.15, ease: [0.22, 1, 0.36, 1] }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function MiniBars({ bars, highlight, color = "#4c8dff", accent = "#e25d2c" }: { bars: { label: string; value: number }[]; highlight?: number; color?: string; accent?: string }) {
  const reduce = useReduced();
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div>
      <div className="flex h-56 items-end gap-[3px]" aria-hidden="true">
        {bars.map((b, i) => (
          <motion.div
            key={b.label}
            className="flex-1 rounded-t-[4px]"
            style={{ background: i === highlight ? accent : color, transformOrigin: "bottom" }}
            initial={reduce ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ height: `${(b.value / max) * 224}px` }} />
          </motion.div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-fg-3">
        <span>{bars[0].label}</span>
        <span>{bars[Math.floor(bars.length / 2)].label}</span>
        <span>{bars[bars.length - 1].label}</span>
      </div>
    </div>
  );
}
