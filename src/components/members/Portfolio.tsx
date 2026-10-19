"use client";
// "What are my funds costing me?" Users add what they hold; we price it on real NAVs.
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Odometer } from "@/components/motion/Odometer";
import { Segmented } from "@/components/motion/Segmented";
import { Button } from "@/components/site/Button";
import { FundPicker } from "@/components/sip/SipSimulator";
import type { FundLite } from "@/lib/data";
import { latestNav, navOn } from "@/lib/finance";
import { monthYear, rupees, rupeesShort } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { Plan } from "@/lib/types";
import { useSeries } from "@/lib/useSeries";

interface Holding {
  id: string;
  fund_slug: string;
  plan: Plan;
  amount: number;
  invested_on: string;
}

const THIS_MONTH = new Date().toISOString().slice(0, 7);

export function Portfolio({ funds }: { funds: FundLite[] }) {
  const [rows, setRows] = useState<Holding[] | null>(null);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState(funds[0].slug);
  const [plan, setPlan] = useState<Plan>("regular");
  const [amount, setAmount] = useState(100000);
  const [month, setMonth] = useState("2018-01");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.from("holdings").select("*").order("created_at");
    if (error) setError("Couldn't load your holdings. Has the database been set up? (see SETUP.md)");
    setRows((data as Holding[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.from("holdings").insert({ fund_slug: slug, plan, amount, invested_on: `${month}-01` });
    if (error) setError("Couldn't save that holding. Please try again.");
    await load();
    setBusy(false);
  }

  async function remove(id: string) {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setRows((r) => r?.filter((x) => x.id !== id) ?? null);
    await supabase.from("holdings").delete().eq("id", id);
  }

  const bySlug = useMemo(() => new Map(funds.map((f) => [f.slug, f])), [funds]);
  const needed = useMemo(() => {
    const codes = new Set<string>();
    rows?.forEach((h) => {
      const f = bySlug.get(h.fund_slug);
      if (f) {
        codes.add(f.directCode);
        codes.add(f.regularCode);
      }
    });
    return [...codes].sort();
  }, [rows, bySlug]);
  const series = useSeries(needed);

  const priced = useMemo(() => {
    if (!rows || !series) return null;
    const byCode = new Map(series.map((s) => [s.scheme_code, s.weekly]));
    return rows
      .map((h) => {
        const f = bySlug.get(h.fund_slug);
        if (!f) return null;
        const d = byCode.get(f.directCode);
        const r = byCode.get(f.regularCode);
        if (!d || !r) return null;
        const d0 = navOn(d, h.invested_on);
        const r0 = navOn(r, h.invested_on);
        const d1 = latestNav(d);
        const r1 = latestNav(r);
        if (!d0 || !r0 || !d1 || !r1) return null;
        const directValue = (h.amount * (d1.nav as number)) / (d0.nav as number);
        const regularValue = (h.amount * (r1.nav as number)) / (r0.nav as number);
        const value = h.plan === "direct" ? directValue : regularValue;
        const lost = h.plan === "regular" ? directValue - regularValue : 0;
        // Rough 10-year outlook if this money stays in Regular: grow both at their past rates
        const future =
          h.plan === "regular" && f.directCagr != null && f.regularCagr != null
            ? regularValue * ((1 + f.directCagr) ** 10 - (1 + f.regularCagr) ** 10)
            : 0;
        return { h, f, value, lost, future, pricedFrom: d0.date };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [rows, series, bySlug]);

  const totals = priced?.reduce(
    (t, p) => ({ invested: t.invested + p.h.amount, value: t.value + p.value, lost: t.lost + p.lost, future: t.future + p.future }),
    { invested: 0, value: 0, lost: 0, future: 0 }
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
        <div className="bg-ink-850 p-6">
          <p className="text-sm text-fg-2">Your funds are worth</p>
          <p className="mt-3 font-display text-4xl font-semibold leading-none">
            <Odometer value={totals ? rupeesShort(totals.value) : "₹0"} />
          </p>
          <p className="mt-2 text-sm text-fg-3">from {totals ? rupeesShort(totals.invested) : "₹0"} invested</p>
        </div>
        <div className="bg-ink-850 p-6">
          <p className="text-sm text-fg-2">Lost to Regular plans so far</p>
          <p className="mt-3 font-display text-4xl font-semibold leading-none text-regular">
            <Odometer value={totals ? rupeesShort(totals.lost) : "₹0"} />
          </p>
          <p className="mt-2 text-sm text-fg-3">vs holding the Direct plan instead</p>
        </div>
        <div className="bg-ink-850 p-6">
          <p className="text-sm text-fg-2">Next 10 years, if nothing changes</p>
          <p className="mt-3 font-display text-4xl font-semibold leading-none">
            <Odometer value={totals ? rupeesShort(totals.future) : "₹0"} />
          </p>
          <p className="mt-2 text-sm text-fg-3">rough estimate at each fund&apos;s past rates</p>
        </div>
      </div>

      <form onSubmit={add} className="grid gap-4 rounded-3xl border border-line bg-ink-850/70 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-[1.5fr_auto_1fr_1fr_auto] xl:items-end">
        <label className="block">
          <span className="mb-2 block text-sm text-fg-2">Fund you hold</span>
          <FundPicker funds={funds} value={slug} onChange={setSlug} />
        </label>
        <div>
          <span className="mb-2 block text-sm text-fg-2">Plan</span>
          <Segmented id="holding-plan" label="Plan" value={plan} onChange={setPlan} options={[{ value: "regular", label: "Regular" }, { value: "direct", label: "Direct" }]} />
        </div>
        <label className="block">
          <span className="mb-2 block text-sm text-fg-2">Amount invested (₹)</span>
          <input
            type="number"
            min={500}
            step={500}
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="tnum h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-fg focus:border-direct/60 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-fg-2">Invested in</span>
          <input
            type="month"
            min="2013-01"
            max={THIS_MONTH}
            required
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-fg [color-scheme:dark] focus:border-direct/60 focus:outline-none"
          />
        </label>
        <Button type="submit" disabled={busy} className="h-11">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
        </Button>
      </form>
      {error && <p className="text-sm text-regular">{error}</p>}

      {rows === null ? (
        <div className="h-32 animate-pulse rounded-3xl bg-white/[0.03]" />
      ) : rows.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line p-10 text-center text-fg-2">
          Add the first fund you hold. Not sure which plan you have? Your account statement says “Regular” or “Direct” in the scheme name.
        </p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {(priced ?? []).map((p) => (
              <motion.li
                key={p.h.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid items-center gap-4 rounded-2xl border border-line bg-ink-850 p-5 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
              >
                <div>
                  <p className="font-semibold">{p.f.name}</p>
                  <p className="text-sm text-fg-3">
                    {p.h.plan === "direct" ? "Direct" : "Regular"} plan, {rupees(p.h.amount)} in {monthYear(p.h.invested_on)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-fg-3">Worth today</p>
                  <p className="tnum font-semibold">{rupeesShort(p.value)}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-3">Lost to commission</p>
                  <p className={`tnum font-semibold ${p.lost > 0 ? "text-regular" : "text-mint"}`}>{p.h.plan === "direct" ? "Nothing, it's Direct" : rupeesShort(p.lost)}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-3">Next 10 years (est.)</p>
                  <p className="tnum font-semibold">{p.h.plan === "direct" ? "–" : rupeesShort(p.future)}</p>
                </div>
                <button onClick={() => remove(p.h.id)} className="grid h-9 w-9 place-items-center rounded-full text-fg-3 transition hover:bg-white/[0.06] hover:text-regular" aria-label={`Remove ${p.f.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      <p className="text-sm text-fg-3">
        Priced on weekly NAVs from the first trading week of the month you invested. Estimates ignore taxes and exit loads; switching plans can trigger capital-gains tax, so check before you move money. Not investment advice.
      </p>
    </div>
  );
}
