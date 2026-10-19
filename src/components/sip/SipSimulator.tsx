"use client";
import { motion } from "framer-motion";
import { Bookmark, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { C, EChart, Key, baseOption, line } from "@/components/charts/EChart";
import { Odometer } from "@/components/motion/Odometer";
import { Segmented } from "@/components/motion/Segmented";
import { Button } from "@/components/site/Button";
import type { FundOption } from "@/lib/data";
import { runSip } from "@/lib/finance";
import { CATEGORY_LABEL, CATEGORY_ORDER, monthYear, pct, rupees, rupeesAxis, rupeesShort } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";
import type { Plan } from "@/lib/types";
import { useSeries } from "@/lib/useSeries";

const YEARS = Array.from({ length: 11 }, (_, i) => 2013 + i);

export function FundPicker({ funds, value, onChange, id }: { funds: FundOption[]; value: string; onChange: (slug: string) => void; id?: string }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full cursor-pointer rounded-xl border border-line bg-white/[0.03] px-3 text-fg focus:border-direct/60 focus:outline-none"
    >
      {CATEGORY_ORDER.map((c) => (
        <optgroup key={c} label={CATEGORY_LABEL[c]}>
          {funds
            .filter((f) => f.category === c)
            .map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

export function SipSimulator({ funds, indexSlug }: { funds: FundOption[]; indexSlug: string }) {
  const params = useSearchParams();
  const initialFund = funds.find((f) => f.slug === params.get("fund"))?.slug ?? "hdfc-flexi-cap";
  const [slug, setSlug] = useState(funds.some((f) => f.slug === initialFund) ? initialFund : funds[0].slug);
  const [plan, setPlan] = useState<Plan>(params.get("plan") === "regular" ? "regular" : "direct");
  const [monthly, setMonthly] = useState(Number(params.get("amount")) || 5000);
  const [year, setYear] = useState(Number(params.get("year")) || 2016);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const { user } = useUser();

  const fund = funds.find((f) => f.slug === slug)!;
  const index = funds.find((f) => f.slug === indexSlug)!;
  const code = plan === "direct" ? fund.directCode : fund.regularCode;
  const indexCode = plan === "direct" ? index.directCode : index.regularCode;
  const series = useSeries([code, indexCode]);

  const result = useMemo(() => {
    if (!series) return null;
    const f = runSip(series[0].weekly, monthly, `${year}-01-01`);
    const ix = f ? runSip(series[1].weekly, monthly, f.path[0].date) : null;
    return { f, ix };
  }, [series, monthly, year]);

  const option = useMemo(() => {
    const r = result?.f;
    if (!r) return null;
    return {
      ...baseOption({
        y: rupeesAxis,
        tooltip: (items: { dataIndex: number }[]) => {
          const p = r.path[items[0].dataIndex];
          return `<b>${monthYear(p.date)}</b><br/>Worth: <b>${rupeesShort(p.value)}</b><br/>Put in: ${rupeesShort(p.invested)}`;
        },
      }),
      series: [
        line("Put in", r.path.map((p) => [p.date, p.invested] as [string, number]), C.index, { step: "end", smooth: false, lineStyle: { width: 1.6, color: C.index, type: [5, 4] } }),
        line("Worth", r.path.map((p) => [p.date, p.value] as [string, number]), "#3ddc97", {
          areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(61,220,151,0.35)" }, { offset: 1, color: "rgba(61,220,151,0)" }] } },
        }),
      ],
    };
  }, [result]);

  async function save() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setSaved("saving");
    const { error } = await supabase.from("sip_plans").insert({ fund_slug: slug, plan, monthly, start_year: year });
    setSaved(error ? "error" : "saved");
  }

  const r = result?.f;
  const startedLate = r && r.path[0].date > `${year}-01-31`;

  return (
    <div className="mx-auto max-w-page px-5 sm:px-8">
      <div className="grid gap-5 rounded-3xl border border-line bg-ink-850/70 p-5 sm:p-7 md:grid-cols-2 lg:grid-cols-[1.4fr_auto_1.2fr_0.8fr] lg:items-end">
        <label className="block">
          <span className="mb-2 block h-5 text-sm text-fg-2">Fund</span>
          <FundPicker funds={funds} value={slug} onChange={(s) => (setSlug(s), setSaved("idle"))} />
        </label>
        <div>
          <span className="mb-2 block h-5 text-sm text-fg-2">Plan</span>
          <Segmented id="sip-plan" label="Plan" value={plan} onChange={(p) => (setPlan(p), setSaved("idle"))} options={[{ value: "direct", label: "Direct" }, { value: "regular", label: "Regular" }]} />
        </div>
        <label className="block">
          <span className="mb-2 flex h-5 justify-between text-sm text-fg-2">
            Every month <span className="tnum font-semibold text-fg">{rupees(monthly)}</span>
          </span>
          <input type="range" min={1000} max={50000} step={1000} value={monthly} onChange={(e) => (setMonthly(Number(e.target.value)), setSaved("idle"))} className="h-11 w-full accent-[#3ddc97]" />
        </label>
        <label className="block">
          <span className="mb-2 block h-5 text-sm text-fg-2">Starting</span>
          <select
            value={year}
            onChange={(e) => (setYear(Number(e.target.value)), setSaved("idle"))}
            className="h-11 w-full cursor-pointer rounded-xl border border-line bg-white/[0.03] px-3 text-fg focus:outline-none"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Jan {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
        {[
          { k: "You put in", v: r ? rupeesShort(r.invested) : "–", s: r ? `${r.months} monthly instalments` : "" },
          { k: "Worth today", v: r ? rupeesShort(r.value) : "–", s: r ? `${r.value >= r.invested ? "a gain of" : "a loss of"} ${rupeesShort(Math.abs(r.value - r.invested))}` : "" },
          { k: "Yearly return", v: r?.xirr != null ? pct(r.xirr) : "–", s: "XIRR: the CAGR for money added over time" },
          { k: "Same SIP in the index fund", v: result?.ix ? rupeesShort(result.ix.value) : "–", s: result?.ix?.xirr != null ? `${pct(result.ix.xirr)} a year` : "" },
        ].map((m, i) => (
          <motion.div key={m.k} className="bg-ink-850 p-5 sm:p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
            <dt className="text-sm text-fg-2">{m.k}</dt>
            <dd className="mt-3 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-none">
              <Odometer value={m.v} />
            </dd>
            <p className="mt-2 text-sm text-fg-3">{m.s}</p>
          </motion.div>
        ))}
      </dl>

      <div className="mt-8 rounded-3xl border border-line bg-ink-850/70 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Key
            items={[
              { label: "What it was worth", color: "#3ddc97" },
              { label: "Money put in", color: C.index, dashed: true },
            ]}
          />
          {user ? (
            <Button variant="ghost" onClick={save} disabled={saved === "saving" || saved === "saved"} className="h-10 py-0 text-sm">
              {saved === "saved" ? <Check className="h-4 w-4 text-mint" /> : <Bookmark className="h-4 w-4" />}
              {saved === "saved" ? "Saved to your dashboard" : saved === "error" ? "Couldn't save, try again" : "Save this plan"}
            </Button>
          ) : (
            <Link href="/login?next=/sip" className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg-2 hover:border-white/30 hover:text-fg">
              <Bookmark className="h-4 w-4" /> Sign in to save plans
            </Link>
          )}
        </div>
        <EChart option={option} height={380} label={`Growth of a ${rupees(monthly)} monthly SIP in ${fund.name}`} />
        <p className="mt-4 max-w-3xl text-sm text-fg-3">
          {startedLate && r && `This fund's data begins in ${monthYear(r.path[0].date)}, so the SIP starts there. `}
          Where the green line dips below the dashed one, the investor was sitting on a loss. Carrying on through those
          months is what built the final number.
        </p>
      </div>
    </div>
  );
}
