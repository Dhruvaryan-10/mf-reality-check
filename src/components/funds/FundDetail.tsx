"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { C, EChart, Key, baseOption, line } from "@/components/charts/EChart";
import { Odometer } from "@/components/motion/Odometer";
import { Reveal } from "@/components/motion/Reveal";
import { Segmented } from "@/components/motion/Segmented";
import { recoveryAfterWorstFall } from "@/lib/finance";
import { fullDate, monthYear, pct, rupeesAxis, rupeesShort } from "@/lib/format";
import type { Fund, Plan } from "@/lib/types";
import { useSeries } from "@/lib/useSeries";

type View = "growth" | "rolling" | "falls";

export function FundDetail({ fund, indexCodes, isIndex }: { fund: Fund; indexCodes: Record<Plan, string>; isIndex: boolean }) {
  const [plan, setPlan] = useState<Plan>("direct");
  const [view, setView] = useState<View>("growth");
  const [amount, setAmount] = useState(1000000);
  const row = fund[plan];
  const series = useSeries([row.scheme_code, indexCodes[plan]]);

  const growth = useMemo(() => {
    if (!series) return null;
    const [f, ix] = series;
    const pts = f.weekly.filter((p) => p.nav != null);
    const ixMap = new Map(ix.weekly.filter((p) => p.nav != null).map((p) => [p.date, p.nav as number]));
    const f0 = pts[0].nav as number;
    const i0 = ixMap.get(pts[0].date);
    return {
      start: pts[0].date,
      fund: pts.map((p) => [p.date, (1e5 * (p.nav as number)) / f0] as [string, number]),
      index: i0 ? pts.filter((p) => ixMap.has(p.date)).map((p) => [p.date, (1e5 * ixMap.get(p.date)!) / i0] as [string, number]) : [],
    };
  }, [series]);

  const recovery = useMemo(() => (series ? recoveryAfterWorstFall(series[0].weekly) : null), [series]);

  const option = useMemo(() => {
    if (!series || !growth) return null;
    const w = series[0].weekly;
    const pick = (k: "roll5" | "index_roll5" | "drawdown" | "index_drawdown") =>
      w.filter((p) => p[k] != null).map((p) => [p.date, p[k] as number] as [string, number]);
    const tip = (fmt: (v: number) => string) => (items: { data: [string, number]; marker: string; seriesName: string }[]) =>
      `<b>${monthYear(items[0].data[0])}</b><br/>` + items.map((it) => `${it.marker}${it.seriesName}: <b>${fmt(it.data[1])}</b>`).join("<br/>");
    const indexLine = (data: [string, number][]) => line("Nifty 50 index fund", data, C.index, { lineStyle: { width: 1.6, color: C.index, type: [5, 4] } });
    const area = (color: string) => ({
      areaStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${color}55` }, { offset: 1, color: `${color}00` }] },
      },
    });

    if (view === "growth")
      return {
        ...baseOption({ y: rupeesAxis, tooltip: tip(rupeesShort) }),
        series: [...(isIndex ? [] : [indexLine(growth.index)]), line(fund.name, growth.fund, C.direct, area(C.direct))],
      };
    if (view === "rolling")
      return {
        ...baseOption({ y: (v) => pct(v, 0), tooltip: tip((v) => `${pct(v)} a year`) }),
        series: [
          ...(isIndex ? [] : [indexLine(pick("index_roll5"))]),
          line(fund.name, pick("roll5"), C.direct, {
            markLine: { silent: true, symbol: "none", label: { show: false }, lineStyle: { color: "rgba(232,236,244,0.35)", type: "solid" }, data: [{ yAxis: 0 }] },
          }),
        ],
      };
    return {
      ...baseOption({ y: (v) => pct(v, 0), tooltip: tip((v) => pct(v)) }),
      series: [...(isIndex ? [] : [indexLine(pick("index_drawdown"))]), line(fund.name, pick("drawdown"), C.regular, { areaStyle: { color: "rgba(226,93,44,0.16)" } })],
    };
  }, [series, growth, view, isIndex, fund.name]);

  const smallerCos = fund.category === "mid_cap" || fund.category === "small_cap";
  const endValue = growth?.fund.at(-1)?.[1];
  const indexEnd = growth?.index.at(-1)?.[1];
  const scale = amount / 1e6;

  const notes: Record<View, React.ReactNode> = {
    growth: (
      <>
        <p>
          ₹1 lakh put into this fund in {growth ? monthYear(growth.start) : "…"} would be worth <strong className="text-fg">{rupeesShort(endValue)}</strong> today
          {!isIndex && indexEnd ? (
            <>
              . In the Nifty 50 index fund, the same ₹1 lakh became <strong className="text-fg">{rupeesShort(indexEnd)}</strong>.
            </>
          ) : (
            "."
          )}
        </p>
        <p className="text-fg-3">The bumps are normal. What matters for a long-term investor is where it ends up, and whether you could have held on through the dips.</p>
      </>
    ),
    rolling: (
      <>
        <p>
          Each point is the yearly return of someone who invested exactly five years before that date. Typical: <strong className="text-fg">{pct(row.roll5_median)}</strong>. Unluckiest:{" "}
          {pct(row.roll5_min)}. Luckiest: {pct(row.roll5_max)}.
        </p>
        {!isIndex && row.roll5_beat_index != null && (
          <p>
            Where blue sits above grey, the fund beat the index over that stretch. It did in <strong className="text-fg">{pct(row.roll5_beat_index, 0)}</strong> of windows.
          </p>
        )}
        {smallerCos && <p className="text-fg-3">The Nifty 50 holds the biggest companies, and smaller ones did better over this period. Beating it says as much about company size as about skill.</p>}
      </>
    ),
    falls: (
      <>
        <p>
          Zero means a new high. The worst fall was <strong className="text-fg">{pct(row.max_drawdown)}</strong>, bottoming on {fullDate(row.max_drawdown_date)}.
          {recovery?.monthsToRecover != null && ` It took about ${recovery.monthsToRecover} months to get back to the old high.`}
        </p>
        <p className="text-fg-3">Picture your own money shrinking by this much. If you would have sold at the bottom, the fund&apos;s later returns would never have reached you.</p>
      </>
    ),
  };

  return (
    <div className="mx-auto max-w-page px-5 sm:px-8">
      <Segmented
        id="fund-plan"
        label="Plan"
        value={plan}
        onChange={setPlan}
        options={[
          { value: "direct", label: "Direct plan" },
          { value: "regular", label: "Regular plan" },
        ]}
      />

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
        {[
          { k: "Last 5 years", v: pct(row.cagr_5y), s: "average yearly growth" },
          { k: "Typical 5-year return", v: pct(row.roll5_median), s: "median of every 5-year window" },
          { k: "Worst fall", v: pct(row.max_drawdown), s: `from a high, ${monthYear(row.max_drawdown_date)}` },
          { k: "₹5,000 a month since 2016", v: rupeesShort(row.sip_value), s: `from ${rupeesShort(row.sip_invested)} put in` },
        ].map((m) => (
          <div key={m.k} className="bg-ink-850 p-5 sm:p-6">
            <dt className="text-sm text-fg-2">{m.k}</dt>
            <dd className="mt-3 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-none">
              <Odometer value={m.v} />
            </dd>
            <p className="mt-2 text-sm text-fg-3">{m.s}</p>
          </div>
        ))}
      </dl>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]" aria-label="Charts">
        <div className="min-w-0 rounded-3xl border border-line bg-ink-850/70 p-4 sm:p-6">
          <div className="-mx-1 mb-5 overflow-x-auto px-1">
            <Segmented
              id="fund-view"
              label="Chart"
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: "growth", label: "Growth of ₹1 lakh" },
                { value: "rolling", label: "Every 5-year window" },
                { value: "falls", label: "Falls from the peak" },
              ]}
            />
          </div>
          <Key
            items={[
              { label: `${fund.name} (${plan === "direct" ? "Direct" : "Regular"})`, color: view === "falls" ? C.regular : C.direct },
              ...(isIndex ? [] : [{ label: "Nifty 50 index fund", color: C.index, dashed: true }]),
            ]}
          />
          <EChart option={option} height={360} label={`${view} chart for ${fund.name}`} />
          <p className="mt-3 text-xs text-fg-3">One point per week, so a single worst day can sit slightly below the line.</p>
        </div>
        <aside className="lg:pt-2">
          <h2 className="font-display text-xl font-semibold">What this shows</h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={view + plan}
              className="mt-4 space-y-4 leading-relaxed text-fg-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {notes[view]}
            </motion.div>
          </AnimatePresence>
        </aside>
      </section>

      {fund.dvr && (
        <Reveal>
          <section className="relative mt-14 overflow-hidden rounded-3xl border border-line bg-ink-850 p-6 sm:p-10" aria-labelledby="cost-title">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(226,93,44,0.25),transparent)]" aria-hidden="true" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
              <div>
                <h2 id="cost-title" className="font-display text-3xl font-semibold leading-tight">
                  What the Regular plan cost here
                </h2>
                <p className="mt-3 max-w-md text-fg-2">
                  Invested in both plans on {fullDate(fund.dvr.start_date)}. The Regular plan grew about {pct(fund.dvr.yearly_gap)} a year slower over {fund.dvr.years} years.
                </p>
                <label className="mt-6 block max-w-sm">
                  <span className="flex justify-between text-sm text-fg-2">
                    <span>Amount invested</span>
                    <span className="tnum font-semibold text-fg">{rupeesShort(amount, amount >= 1e7 ? 2 : 0)}</span>
                  </span>
                  <input type="range" min={100000} max={5000000} step={100000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-3 w-full accent-[#4c8dff]" />
                </label>
              </div>
              <div className="lg:text-right">
                <p className="font-display text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-none text-fg">
                  <Odometer value={rupeesShort(fund.dvr.rupees_lost * scale)} />
                </p>
                <p className="mt-2 text-fg-2">lost to commission, so far</p>
                <p className="tnum mt-4 flex gap-5 text-sm text-fg-3 lg:justify-end">
                  <span>
                    Direct grew to <span className="text-direct">{rupeesShort(fund.dvr.direct_value * scale)}</span>
                  </span>
                  <span>
                    Regular to <span className="text-regular">{rupeesShort(fund.dvr.regular_value * scale)}</span>
                  </span>
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
