"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkline } from "@/components/charts/Sparkline";
import { MagicCard } from "@/components/motion/MagicCard";
import type { FundLite } from "@/lib/data";
import { CATEGORY_LABEL, pct } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function Watchlist({ funds }: { funds: FundLite[] }) {
  const [slugs, setSlugs] = useState<string[] | null>(null);
  useEffect(() => {
    getBrowserSupabase()
      ?.from("watchlist")
      .select("fund_slug")
      .order("created_at")
      .then(({ data }) => setSlugs((data ?? []).map((r: { fund_slug: string }) => r.fund_slug)));
  }, []);

  async function remove(slug: string) {
    setSlugs((s) => s?.filter((x) => x !== slug) ?? null);
    await getBrowserSupabase()?.from("watchlist").delete().eq("fund_slug", slug);
  }

  if (slugs === null) return <div className="h-48 animate-pulse rounded-3xl bg-white/[0.03]" />;
  const list = slugs.map((s) => funds.find((f) => f.slug === s)).filter((f): f is FundLite => !!f);

  if (!list.length)
    return (
      <div className="rounded-3xl border border-dashed border-line p-10 text-center">
        <Star className="mx-auto h-8 w-8 text-fg-3" />
        <p className="mt-4 text-fg-2">Your watchlist is empty. Open any fund and select “Add to watchlist”.</p>
        <Link href="/funds" className="mt-5 inline-flex rounded-full bg-fg px-5 py-2.5 font-semibold text-ink-900">
          Browse funds
        </Link>
      </div>
    );

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {list.map((f) => (
          <motion.li key={f.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <MagicCard className="h-full">
              <div className="relative p-6">
                <button onClick={() => remove(f.slug)} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-fg-3 hover:bg-white/[0.06] hover:text-fg" aria-label={`Remove ${f.name} from watchlist`}>
                  <X className="h-4 w-4" />
                </button>
                <p className="text-sm text-fg-3">{CATEGORY_LABEL[f.category]}</p>
                <Link href={`/funds/${f.slug}`} className="mt-1 block pr-8 font-display text-xl font-semibold hover:text-direct">
                  {f.name}
                </Link>
                <div className="my-4 h-12">
                  <Sparkline values={f.spark} />
                </div>
                <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                  <div>
                    <dt className="text-fg-3">Typical 5y</dt>
                    <dd className="tnum font-semibold">{pct(f.roll5)}</dd>
                  </div>
                  <div>
                    <dt className="text-fg-3">Worst fall</dt>
                    <dd className="tnum font-semibold">{pct(f.fall)}</dd>
                  </div>
                </dl>
              </div>
            </MagicCard>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
