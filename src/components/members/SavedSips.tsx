"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarClock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FundLite } from "@/lib/data";
import { rupees } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase/client";

interface SipRow {
  id: string;
  fund_slug: string;
  plan: "direct" | "regular";
  monthly: number;
  start_year: number;
}

export function SavedSips({ funds }: { funds: FundLite[] }) {
  const [rows, setRows] = useState<SipRow[] | null>(null);
  useEffect(() => {
    getBrowserSupabase()
      ?.from("sip_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as SipRow[]) ?? []));
  }, []);

  async function remove(id: string) {
    setRows((r) => r?.filter((x) => x.id !== id) ?? null);
    await getBrowserSupabase()?.from("sip_plans").delete().eq("id", id);
  }

  if (rows === null) return <div className="h-40 animate-pulse rounded-3xl bg-white/[0.03]" />;
  if (!rows.length)
    return (
      <div className="rounded-3xl border border-dashed border-line p-10 text-center">
        <CalendarClock className="mx-auto h-8 w-8 text-fg-3" />
        <p className="mt-4 text-fg-2">No saved SIPs yet. Try one in the simulator and select “Save this plan”.</p>
        <Link href="/sip" className="mt-5 inline-flex rounded-full bg-fg px-5 py-2.5 font-semibold text-ink-900">
          Open the SIP simulator
        </Link>
      </div>
    );

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {rows.map((r) => {
          const f = funds.find((x) => x.slug === r.fund_slug);
          return (
            <motion.li key={r.id} layout exit={{ opacity: 0, x: -20 }} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-ink-850 p-5">
              <div>
                <p className="font-semibold">{f?.name ?? r.fund_slug}</p>
                <p className="text-sm text-fg-3">
                  {rupees(r.monthly)} a month from Jan {r.start_year}, {r.plan === "direct" ? "Direct" : "Regular"} plan
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/sip?fund=${r.fund_slug}&plan=${r.plan}&amount=${r.monthly}&year=${r.start_year}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-sm hover:border-white/30"
                >
                  Open <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button onClick={() => remove(r.id)} className="grid h-9 w-9 place-items-center rounded-full text-fg-3 hover:bg-white/[0.06] hover:text-regular" aria-label="Delete saved SIP">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
