"use client";
// Members: pick up to three funds and see them on one chart and one table.
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { C, EChart, Key, baseOption, line } from "@/components/charts/EChart";
import { Segmented } from "@/components/motion/Segmented";
import { cn } from "@/lib/cn";
import type { FundLite } from "@/lib/data";
import { CATEGORY_LABEL, CATEGORY_ORDER, monthYear, pct, rupeesAxis, rupeesShort } from "@/lib/format";
import type { Plan } from "@/lib/types";
import { useSeries } from "@/lib/useSeries";

const MAX = 3;

export function CompareTool({ funds }: { funds: FundLite[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const fromUrl = (params.get("funds") ?? "").split(",").filter((s) => funds.some((f) => f.slug === s));
  const [picked, setPicked] = useState<string[]>(fromUrl.length ? fromUrl.slice(0, MAX) : ["parag-parikh-flexi-cap", "uti-nifty-50-index"].filter((s) => funds.some((f) => f.slug === s)));
  const [plan, setPlan] = useState<Plan>("direct");

  function toggle(slug: string) {
    const next = picked.includes(slug) ? picked.filter((s) => s !== slug) : picked.length >= MAX ? picked : [...picked, slug];
    setPicked(next);
    router.replace(`/compare?funds=${next.join(",")}`, { scroll: false });
  }

  const chosen = picked.map((s) => funds.find((f) => f.slug === s)!).filter(Boolean);
  const series = useSeries(chosen.map((f) => (plan === "direct" ? f.directCode : f.regularCode)));

  const option = useMemo(() => {
    if (!series || !series.length) return null;
    // Start everyone on the first date all of them have data
    const start = series.map((s) => s.weekly.find((p) => p.nav != null)!.date).sort().at(-1)!;
    const lines = series.map((s, i) => {
      const pts = s.weekly.filter((p) => p.nav != null && p.date >= start);
      const n0 = pts[0].nav as number;
      return line(chosen[i].name, pts.map((p) => [p.date, (1e5 * (p.nav as number)) / n0] as [string, number]), C.extra[i]);
    });
    return {
      ...baseOption({
        y: rupeesAxis,
        tooltip: (items: { data: [string, number]; marker: string; seriesName: string }[]) =>
          `<b>${monthYear(items[0].data[0])}</b><br/>` + items.map((it) => `${it.marker}${it.seriesName}: <b>${rupeesShort(it.data[1])}</b>`).join("<br/>"),
      }),
      series: lines,
    };
  }, [series, chosen]);

  const rows: { label: string; get: (f: FundLite) => number | null; fmt: (v: number | null) => string; better: "high" | "low" }[] = [
    { label: "Last 5 years, a year", get: (f) => f.cagr5, fmt: (v) => pct(v), better: "high" },
    { label: "Typical 5-year return", get: (f) => f.roll5, fmt: (v) => pct(v), better: "high" },
    { label: "Worst 5-year return", get: (f) => f.roll5min, fmt: (v) => pct(v), better: "high" },
    { label: "Worst fall", get: (f) => f.fall, fmt: (v) => pct(v), better: "high" },
    { label: "Volatility (bumpiness)", get: (f) => f.volatility, fmt: (v) => pct(v), better: "low" },
    { label: "₹5,000/month since 2016", get: (f) => f.sip, fmt: (v) => rupeesShort(v), better: "high" },
    { label: "Regular plan cost on ₹10 lakh", get: (f) => f.lostPer10L, fmt: (v) => rupeesShort(v), better: "low" },
  ];

  return (
    <div className="mx-auto max-w-page px-5 sm:px-8">
      <div className="rounded-3xl border border-line bg-ink-850/70 p-5 sm:p-6">
        <p className="text-sm text-fg-2">
          Pick up to {MAX} funds <span className="text-fg-3">({picked.length} chosen)</span>
        </p>
        <div className="mt-4 space-y-4">
          {CATEGORY_ORDER.map((c) => (
            <div key={c} className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-xs text-fg-3">{CATEGORY_LABEL[c]}</span>
              {funds
                .filter((f) => f.category === c)
                .map((f) => {
                  const i = picked.indexOf(f.slug);
                  const on = i >= 0;
                  const full = !on && picked.length >= MAX;
                  return (
                    <motion.button
                      key={f.slug}
                      onClick={() => toggle(f.slug)}
                      disabled={full}
                      aria-pressed={on}
                      whileTap={{ scale: 0.96 }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                        on ? "border-transparent text-ink-900" : "border-line text-fg-2 hover:border-white/30 hover:text-fg",
                        full && "cursor-not-allowed opacity-40"
                      )}
                      style={on ? { background: C.extra[i] } : undefined}
                    >
                      {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {f.name}
                    </motion.button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {chosen.length === 0 ? (
        <p className="mt-10 text-center text-fg-2">Pick at least one fund to start comparing.</p>
      ) : (
        <>
          <div className="mt-8 rounded-3xl border border-line bg-ink-850/70 p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">Growth of ₹1 lakh</h2>
              <Segmented id="cmp-plan" label="Plan" size="sm" value={plan} onChange={setPlan} options={[{ value: "direct", label: "Direct" }, { value: "regular", label: "Regular" }]} />
            </div>
            <Key items={chosen.map((f, i) => ({ label: f.name, color: C.extra[i] }))} />
            <EChart option={option} height={380} label={`Growth of ₹1 lakh in ${chosen.map((f) => f.name).join(", ")}`} />
            <p className="mt-3 text-xs text-fg-3">All lines start on the first date every chosen fund has data, so the race is fair.</p>
          </div>

          <div className="mt-8 overflow-x-auto rounded-3xl border border-line">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-white/[0.03] text-sm">
                <tr>
                  <th className="px-5 py-4 font-medium text-fg-3">Direct plan, since 2013</th>
                  {chosen.map((f, i) => (
                    <th key={f.slug} className="px-5 py-4 text-right font-semibold">
                      <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: C.extra[i] }} aria-hidden="true" />
                      {f.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="tnum">
                {rows.map((r) => {
                  const vals = chosen.map(r.get);
                  const valid = vals.filter((v): v is number => v != null);
                  const best = valid.length > 1 ? (r.better === "high" ? Math.max(...valid) : Math.min(...valid)) : null;
                  return (
                    <tr key={r.label} className="border-t border-line">
                      <th className="px-5 py-4 font-normal text-fg-2">{r.label}</th>
                      {vals.map((v, i) => (
                        <td key={i} className="px-5 py-4 text-right">
                          <span className={cn("rounded-full px-2.5 py-1", v != null && v === best && "bg-mint/15 font-semibold text-mint")}>{r.fmt(v)}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-fg-3">Green marks the best value in each row. Past results, not a prediction.</p>
        </>
      )}
    </div>
  );
}
