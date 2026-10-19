"use client";
// The signature moment: a pinned chart that draws itself as you scroll, while the gap
// between the Direct and Regular plan grows (inspired by Aceternity "Sticky Scroll Reveal").
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { monthYear, pct, rupeesAxis, rupeesShort } from "@/lib/format";
import { useReduced } from "@/lib/useReduced";

export interface StoryPoint {
  date: string;
  direct: number;
  regular: number;
}

const W = 640;
const H = 400;
const PAD = { l: 56, r: 16, t: 20, b: 32 };

export function ScrollStory({ fund, points, gapPerYear }: { fund: string; points: StoryPoint[]; gapPerYear: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const drawn = useTransform(progress, [0.04, 0.92], [0, 1], { clamp: true });
  const [idx, setIdx] = useState(0);

  useMotionValueEvent(drawn, "change", (v) => setIdx(Math.round(v * (points.length - 1))));

  const geo = useMemo(() => {
    // Round the axis to a "nice" step (₹50L, ₹1Cr...) so labels read cleanly
    const top = Math.max(...points.map((p) => p.direct));
    const raw = top / 4;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
    const max = Math.ceil(top / step) * step;
    const x = (i: number) => PAD.l + (i / (points.length - 1)) * (W - PAD.l - PAD.r);
    const y = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
    const path = (k: "direct" | "regular") => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
    const band =
      points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.direct).toFixed(1)}`).join(" ") +
      " " +
      [...points].reverse().map((p, j) => `L${x(points.length - 1 - j).toFixed(1)},${y(p.regular).toFixed(1)}`).join(" ") +
      " Z";
    const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
    const years = points
      .map((p, i) => ({ i, y: p.date.slice(0, 4), m: p.date.slice(5, 7) }))
      .filter((p, k, arr) => k === 0 || p.y !== arr[k - 1].y)
      .filter((p) => Number(p.y) % 2 === 1);
    return { x, y, direct: path("direct"), regular: path("regular"), band, ticks, years };
  }, [points]);

  const clipWidth = useTransform(drawn, (v) => PAD.l + v * (W - PAD.l - PAD.r) + 2);
  const shownIdx = reduce ? points.length - 1 : idx;
  const p = points[Math.max(0, Math.min(points.length - 1, shownIdx))];
  const gap = p.direct - p.regular;

  const at = (iso: string) => points.find((q) => q.date >= iso) ?? points[points.length - 1];
  const y3 = at(`${Number(points[0].date.slice(0, 4)) + 3}-01-01`);
  const mid = at("2020-01-01");
  const last = points[points.length - 1];

  const steps = [
    {
      title: `${monthYear(points[0].date)}. Two investors, one fund.`,
      body: `Both put ${rupeesShort(points[0].direct, 0)} into ${fund} on the same day. One buys the Direct plan. The other buys the Regular plan through an agent.`,
    },
    {
      title: "A small fee, taken daily.",
      body: `The Regular plan charges about ${pct(gapPerYear)} more a year, deducted from its price every single day. After three years the gap is ${rupeesShort(y3.direct - y3.regular)}. Easy to miss.`,
    },
    {
      title: "Then it compounds.",
      body: `Money lost to the fee stops growing too. By ${monthYear(mid.date)} the gap is ${rupeesShort(mid.direct - mid.regular)}, and it keeps widening every year the fund does well.`,
    },
    {
      title: `Today: ${rupeesShort(last.direct - last.regular)} apart.`,
      body: "Same shares, same manager, same risk. Neither investor ever saw a bill for it.",
    },
  ];
  // Each step's text starts at this share of the way through the chart; "Today" only at the very end
  const STARTS = [0, 0.18, 0.5, 0.94];
  const frac = shownIdx / (points.length - 1);
  const step = STARTS.reduce((s, start, i) => (frac >= start ? i : s), 0);

  return (
    <section ref={ref} id="story" className="relative" style={{ height: reduce ? "auto" : "360vh" }} aria-label="How the gap grows">
      <div className={reduce ? "" : "sticky top-0 flex h-screen items-center"}>
        <div className="mx-auto grid w-full max-w-page items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="min-h-[15rem] lg:min-h-[19rem]">
            <ol className="mb-8 flex gap-2" aria-hidden="true">
              {steps.map((_, i) => (
                <li key={i} className="h-1 w-10 overflow-hidden rounded-full bg-white/10">
                  <motion.span className="block h-full bg-fg" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                </li>
              ))}
            </ol>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-display text-[clamp(1.9rem,4vw,3.1rem)] font-semibold leading-[1.05]">{steps[step].title}</h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-fg-2">{steps[step].body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative rounded-3xl border border-line bg-ink-850/70 p-4 sm:p-6">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-fg-3">{monthYear(p.date)}: gap between the two</p>
                {/* Plain number: it already moves with the scroll, a rolling counter would fight it */}
                <p className="tnum font-display text-4xl font-semibold text-fg sm:text-5xl">{rupeesShort(gap)}</p>
              </div>
              <ul className="flex gap-4 text-sm text-fg-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 border-t-2 border-direct" aria-hidden="true" />
                  Direct
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 border-t-2 border-regular" aria-hidden="true" />
                  Regular
                </li>
              </ul>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Value of the Direct and Regular plans of ${fund} over time`}>
              <defs>
                <clipPath id="story-clip">
                  <motion.rect x="0" y="0" height={H} style={{ width: reduce ? W : clipWidth }} />
                </clipPath>
                <linearGradient id="story-band" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#e25d2c" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#e25d2c" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              {geo.ticks.map((t) => (
                <g key={t}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={geo.y(t)} y2={geo.y(t)} stroke="rgba(148,163,184,0.12)" />
                  <text x={PAD.l - 10} y={geo.y(t) + 4} textAnchor="end" fontSize="14" fill="#717c95">
                    {rupeesAxis(t)}
                  </text>
                </g>
              ))}
              {geo.years.map((t) => (
                <text key={t.i} x={geo.x(t.i)} y={H - 8} textAnchor="middle" fontSize="14" fill="#717c95">
                  {t.y}
                </text>
              ))}
              <g clipPath="url(#story-clip)">
                <path d={geo.band} fill="url(#story-band)" />
                <path d={geo.regular} fill="none" stroke="#e25d2c" strokeWidth="2.2" strokeLinejoin="round" />
                <path d={geo.direct} fill="none" stroke="#4c8dff" strokeWidth="2.2" strokeLinejoin="round" />
              </g>
              {!reduce && (
                <g>
                  <line x1={geo.x(idx)} x2={geo.x(idx)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(232,236,244,0.25)" strokeDasharray="3 4" />
                  <circle cx={geo.x(idx)} cy={geo.y(p.direct)} r="5" fill="#4c8dff" stroke="#080b14" strokeWidth="2" />
                  <circle cx={geo.x(idx)} cy={geo.y(p.regular)} r="5" fill="#e25d2c" stroke="#080b14" strokeWidth="2" />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
