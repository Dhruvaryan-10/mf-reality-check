"use client";
// The hero's interactive sentence: pick an amount and a fund, see what the Regular plan cost.
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Odometer } from "@/components/motion/Odometer";
import { monthYear, pct, rupeesShort } from "@/lib/format";
import type { DirectVsRegular } from "@/lib/types";

const AMOUNTS = [100000, 500000, 1000000, 2500000];

function InlineSelect({ value, onChange, children, label }: { value: string; onChange: (v: string) => void; children: React.ReactNode; label: string }) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-none border-0 border-b-2 border-direct bg-transparent pb-0.5 pr-6 font-semibold text-fg outline-none transition-colors hover:text-white [field-sizing:content]"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-direct" aria-hidden="true" />
    </label>
  );
}

export function HeroCalculator({ rows }: { rows: DirectVsRegular[] }) {
  const [amount, setAmount] = useState(1000000);
  const [name, setName] = useState(rows[0].fund_name);
  const row = useMemo(() => rows.find((r) => r.fund_name === name) ?? rows[0], [rows, name]);
  const scale = amount / 1_000_000;
  const lost = row.rupees_lost * scale;

  return (
    <motion.div
      className="border-beam glass relative rounded-3xl border border-line p-6 shadow-[0_30px_120px_-40px_rgba(76,141,255,0.45)] sm:p-8"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-[1.15rem] leading-[1.7] text-fg-2 sm:text-[1.3rem]">
        Put{" "}
        <InlineSelect label="Amount" value={String(amount)} onChange={(v) => setAmount(Number(v))}>
          {AMOUNTS.map((a) => (
            <option key={a} value={a}>
              {rupeesShort(a, 0)}
            </option>
          ))}
        </InlineSelect>{" "}
        into{" "}
        <InlineSelect label="Fund" value={name} onChange={setName}>
          {rows.map((r) => (
            <option key={r.fund_name} value={r.fund_name}>
              {r.fund_name}
            </option>
          ))}
        </InlineSelect>{" "}
        in {monthYear(row.start_date)} through an agent instead of directly. Today you&apos;d have
      </p>

      <p className="mt-5 font-display text-[clamp(2.8rem,7vw,4.8rem)] font-semibold leading-none tracking-tight text-fg" aria-live="polite">
        <Odometer value={rupeesShort(lost)} />
      </p>
      <p className="mt-2 text-lg text-fg-2">less, for exactly the same fund.</p>

      <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-line pt-5 text-sm">
        <div>
          <dt className="text-fg-3">Direct grew to</dt>
          <dd className="tnum mt-1 text-base font-semibold text-direct">{rupeesShort(row.direct_value * scale)}</dd>
        </div>
        <div>
          <dt className="text-fg-3">Regular grew to</dt>
          <dd className="tnum mt-1 text-base font-semibold text-regular">{rupeesShort(row.regular_value * scale)}</dd>
        </div>
        <div>
          <dt className="text-fg-3">Commission</dt>
          <dd className="tnum mt-1 text-base font-semibold">{pct(row.yearly_gap)} a year</dd>
        </div>
      </dl>
    </motion.div>
  );
}
