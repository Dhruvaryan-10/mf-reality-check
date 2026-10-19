"use client";
// Seven ideas: text scrolls on the left while a pinned visual on the right swaps to match
// (inspired by Aceternity "Sticky Scroll Reveal").
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MiniBars, MiniLines } from "@/components/charts/MiniLines";
import { cn } from "@/lib/cn";
import { pct, rupeesAxis, rupeesShort } from "@/lib/format";
import type { LearnData } from "@/lib/learnData";

interface Idea {
  term: string;
  long: string;
  body: string;
  example: string;
  visual: ReactNode;
  caption: string;
}

function Block({ idea, i, onActive }: { idea: Idea; i: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);
  return (
    <div ref={ref} id={idea.term.toLowerCase().replace(/[^a-z]+/g, "-")} className="py-16 lg:min-h-[70vh] lg:py-24">
      <p className="tnum text-sm text-fg-3">
        {String(i + 1).padStart(2, "0")} of 07
      </p>
      <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-none">{idea.term}</h2>
      <p className="mt-2 text-lg text-fg-3">{idea.long}</p>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-2">{idea.body}</p>
      <p className="mt-6 max-w-xl rounded-2xl border border-line bg-white/[0.02] px-5 py-4 text-[0.98rem] leading-relaxed text-fg">
        <span className="mr-2 text-fg-3">In the data:</span>
        {idea.example}
      </p>
      {/* On small screens the visual sits under its text */}
      <div className="mt-8 rounded-3xl border border-line bg-ink-850 p-5 lg:hidden">
        {idea.visual}
        <p className="mt-3 text-sm text-fg-3">{idea.caption}</p>
      </div>
    </div>
  );
}

export function LearnScroller({ d }: { d: LearnData }) {
  const [active, setActive] = useState(0);

  const ideas: Idea[] = [
    {
      term: "NAV",
      long: "Net Asset Value",
      body: "The price of one unit of a fund, published every working day. If the NAV goes from ₹100 to ₹120, your money grew 20%. Everything else on this site is built from daily NAVs.",
      example: `${d.nav.fund} (Direct): ₹${d.nav.first.toFixed(2)} in ${d.nav.firstDate}, ₹${d.nav.last.toFixed(2)} on ${d.nav.lastDate}.`,
      visual: <MiniLines series={[{ values: d.nav.values, color: "#4c8dff", area: true }]} yLabels={[{ value: d.nav.first, label: `₹${Math.round(d.nav.first)}` }, { value: d.nav.last, label: `₹${Math.round(d.nav.last)}` }]} />,
      caption: `NAV of ${d.nav.fund}, every week since ${d.nav.firstDate}.`,
    },
    {
      term: "Direct vs Regular",
      long: "two ways to buy the same fund",
      body: "Regular plans are sold through agents, who earn a commission every year you stay invested. Direct plans are bought straight from the fund house, without one. The shares inside are identical; only the yearly fee differs.",
      example: `${d.twin.fund} launched both plans in ${d.twin.since}. Today: Direct ₹${d.twin.directNav.toFixed(2)}, Regular ₹${d.twin.regularNav.toFixed(2)}.`,
      visual: (
        <MiniLines
          series={[
            { values: d.twin.regular, color: "#e25d2c" },
            { values: d.twin.direct, color: "#4c8dff" },
          ]}
        />
      ),
      caption: `${d.twin.fund}: Direct (blue) and Regular (orange) NAV, slowly drifting apart.`,
    },
    {
      term: "Index fund",
      long: "the cheap, boring option",
      body: "A fund with no star manager. It simply buys the 50 biggest companies in the Nifty 50, in the same proportions, so its fees are tiny. It's the yardstick every other fund on this site is measured against.",
      example: `${d.nav.fund} (Direct): ${pct(d.index.cagr)} a year since ${d.index.since}.`,
      visual: <FiftyGrid />,
      caption: "50 companies, held in fixed proportions. No stock picking.",
    },
    {
      term: "SIP",
      long: "Systematic Investment Plan",
      body: "Investing a fixed amount every month instead of a lump sum. You buy more units when prices are low and fewer when they're high, and you never have to guess the right moment.",
      example: `₹5,000 a month into the Nifty 50 index fund since Jan 2016: ${rupeesShort(d.sip.put)} put in, ${rupeesShort(d.sip.total)} today.`,
      visual: (
        <MiniLines
          series={[
            { values: d.sip.invested, color: "#8c96ab", dashed: true },
            { values: d.sip.value, color: "#3ddc97", area: true },
          ]}
          yLabels={[
            { value: 0, label: "₹0" },
            { value: d.sip.put, label: rupeesAxis(d.sip.put) },
            { value: d.sip.total, label: rupeesAxis(d.sip.total) },
          ]}
          min={0}
        />
      ),
      caption: "What the SIP was worth (green) against the money put in (dashed).",
    },
    {
      term: "CAGR",
      long: "average yearly growth",
      body: "If your money had grown at one steady rate every year, what would that rate be? ₹1 lakh becoming ₹2 lakh in 6 years is about 12% a year. It smooths away the bumps, which is why we also show the falls.",
      example: d.cagr.example,
      visual: (
        <MiniLines
          series={[
            { values: d.cagr.real, color: "#4c8dff" },
            { values: d.cagr.smooth, color: "#e8ecf4", dashed: true },
          ]}
        />
      ),
      caption: `The real, bumpy path (blue) and the steady ${pct(d.cagr.rate)} a year that ends in the same place (dashed).`,
    },
    {
      term: "Rolling returns",
      long: "what a typical investor got",
      body: "Instead of measuring from one convenient start date, measure from every possible one. Fund adverts quote their best period; rolling returns show the whole range, from unlucky to lucky.",
      example: `Nifty 50 index fund, last 5 years: ${pct(d.rolling.last5)} a year. Typical 5-year stretch since 2013: ${pct(d.rolling.median)}.`,
      visual: <MiniBars bars={d.rolling.bins} highlight={d.rolling.latestBin} />,
      caption: "Every 5-year period, grouped by its yearly return. Orange holds the most recent one.",
    },
    {
      term: "Drawdown",
      long: "the worst fall from a high",
      body: "How far a fund dropped from its highest point before recovering. It answers the question returns can't: how scary does this get, and could you sit through it without selling?",
      example: `Between its January 2020 high and the COVID low in March, the Nifty 50 index fund fell ${pct(Math.abs(d.drawdown.covid ?? 0))}.`,
      visual: (
        <MiniLines
          series={[{ values: d.drawdown.values, color: "#e25d2c", area: true }]}
          zeroLine
          max={0}
          yLabels={[
            { value: 0, label: "0%" },
            { value: -0.2, label: "−20%" },
            { value: d.drawdown.worst, label: pct(d.drawdown.worst, 0) },
          ]}
        />
      ),
      caption: "Distance below the previous high, every week. Zero means a new high.",
    },
  ];

  return (
    <div className="mx-auto grid max-w-page gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-20">
      <div>
        {ideas.map((idea, i) => (
          <Block key={idea.term} idea={idea} i={i} onActive={setActive} />
        ))}
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="w-full rounded-[1.75rem] border border-line bg-ink-850/80 p-7 shadow-[0_40px_120px_-50px_rgba(76,141,255,0.5)]">
            <div className="mb-6 flex gap-1.5" aria-hidden="true">
              {ideas.map((_, i) => (
                <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= active ? "bg-fg" : "bg-white/10")} />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-5 font-display text-xl font-semibold">{ideas[active].term}</p>
                {ideas[active].visual}
                <p className="mt-4 text-sm text-fg-3">{ideas[active].caption}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function FiftyGrid() {
  return (
    <div className="grid grid-cols-10 gap-2" aria-hidden="true">
      {Array.from({ length: 50 }, (_, i) => {
        // Bigger companies get a bigger weight: a few large squares' worth of colour
        const weight = Math.max(0.18, 1 - i / 34);
        return (
          <motion.span
            key={i}
            className="aspect-square rounded-md"
            style={{ background: `rgba(76,141,255,${weight})` }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.018, duration: 0.35 }}
          />
        );
      })}
    </div>
  );
}
