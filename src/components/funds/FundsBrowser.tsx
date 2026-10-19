"use client";
// Searchable, filterable fund grid. Cards re-flow smoothly when the filter changes.
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, LayoutGrid, Rows3, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Sparkline } from "@/components/charts/Sparkline";
import { MagicCard } from "@/components/motion/MagicCard";
import { Segmented } from "@/components/motion/Segmented";
import { CATEGORY_LABEL, CATEGORY_ORDER, pct, rupeesShort } from "@/lib/format";
import type { Category, Fund } from "@/lib/types";

type Filter = "all" | Category;
type SortKey = "roll5" | "cagr5" | "fall" | "cost" | "name";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "roll5", label: "Typical 5-year return" },
  { value: "cagr5", label: "Last 5 years" },
  { value: "fall", label: "Smallest worst fall" },
  { value: "cost", label: "Regular plan cost" },
  { value: "name", label: "Name" },
];

export function FundsBrowser({ funds }: { funds: Fund[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("roll5");
  const [view, setView] = useState<"grid" | "table">("grid");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = funds
      .filter((f) => (filter === "all" || f.category === filter) && (!q || f.name.toLowerCase().includes(q)))
      .sort((a, b) => {
        switch (sort) {
          case "name":
            return a.name.localeCompare(b.name);
          case "cagr5":
            return (b.direct.cagr_5y ?? 0) - (a.direct.cagr_5y ?? 0);
          case "fall":
            return b.direct.max_drawdown - a.direct.max_drawdown;
          case "cost":
            return (b.dvr?.rupees_lost ?? 0) - (a.dvr?.rupees_lost ?? 0);
          default:
            return (b.direct.roll5_median ?? 0) - (a.direct.roll5_median ?? 0);
        }
      });
    return sorted;
  }, [funds, filter, query, sort]);

  return (
    <div className="mx-auto max-w-page px-5 sm:px-8">
      <div className="sticky top-[4.6rem] z-20 -mx-2 mb-8 flex flex-col gap-3 rounded-3xl border border-line px-3 py-3 glass lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 overflow-x-auto px-1">
          <Segmented
            id="fund-filter"
            label="Type of fund"
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[{ value: "all", label: "All" }, ...CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Search funds</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search funds"
              className="h-10 w-full rounded-full border border-line bg-white/[0.03] pl-9 pr-4 text-sm text-fg placeholder:text-fg-3 focus:border-direct/60 focus:outline-none sm:w-52"
            />
          </label>
          <label>
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 cursor-pointer rounded-full border border-line bg-white/[0.03] px-4 text-sm text-fg focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex rounded-full border border-line p-1" role="group" aria-label="View">
            {(["grid", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                aria-label={v === "grid" ? "Grid view" : "Table view"}
                className={`grid h-8 w-8 place-items-center rounded-full transition ${view === v ? "bg-fg text-ink-900" : "text-fg-2 hover:text-fg"}`}
              >
                {v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 && <p className="py-20 text-center text-fg-2">No fund matches “{query}”. Try a fund house name, like HDFC or Axis.</p>}

      {view === "grid" ? (
        <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((f) => (
              <motion.li
                key={f.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Link href={`/funds/${f.slug}`} className="block h-full rounded-2xl">
                  <MagicCard className="h-full">
                    <div className="flex h-full flex-col p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-fg-3">{CATEGORY_LABEL[f.category]}</p>
                          <h2 className="mt-1 font-display text-xl font-semibold leading-tight">{f.name}</h2>
                        </div>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-fg-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg" />
                      </div>
                      <div className="my-5 h-14">
                        <Sparkline values={f.spark} />
                      </div>
                      <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
                        <div>
                          <dt className="text-fg-3">Typical 5y</dt>
                          <dd className="tnum mt-0.5 font-semibold">{pct(f.direct.roll5_median)}</dd>
                        </div>
                        <div>
                          <dt className="text-fg-3">Worst fall</dt>
                          <dd className="tnum mt-0.5 font-semibold">{pct(f.direct.max_drawdown)}</dd>
                        </div>
                        <div>
                          <dt className="text-fg-3">Regular cost</dt>
                          <dd className="tnum mt-0.5 font-semibold text-regular">{f.dvr ? rupeesShort(f.dvr.rupees_lost) : "–"}</dd>
                        </div>
                      </dl>
                    </div>
                  </MagicCard>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.03] text-fg-3">
              <tr>
                <th className="px-4 py-3 font-medium">Fund</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 text-right font-medium">Last 5 years</th>
                <th className="px-4 py-3 text-right font-medium">Typical 5-year</th>
                <th className="px-4 py-3 text-right font-medium">Worst fall</th>
                <th className="px-4 py-3 text-right font-medium">Beat Nifty 50</th>
                <th className="px-4 py-3 text-right font-medium">Regular cost on ₹10L</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {list.map((f) => (
                <tr key={f.slug} className="border-t border-line transition hover:bg-white/[0.03]">
                  <th className="px-4 py-3 font-semibold">
                    <Link href={`/funds/${f.slug}`} className="hover:text-direct">
                      {f.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-fg-2">{CATEGORY_LABEL[f.category]}</td>
                  <td className="px-4 py-3 text-right">{pct(f.direct.cagr_5y)}</td>
                  <td className="px-4 py-3 text-right">{pct(f.direct.roll5_median)}</td>
                  <td className="px-4 py-3 text-right">{pct(f.direct.max_drawdown)}</td>
                  <td className="px-4 py-3 text-right">{f.direct.roll5_beat_index == null ? "–" : pct(f.direct.roll5_beat_index, 0)}</td>
                  <td className="px-4 py-3 text-right text-regular">{f.dvr ? rupeesShort(f.dvr.rupees_lost) : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-6 text-sm text-fg-3">All figures are for the Direct plan since 2013, except “Regular cost”: what choosing the Regular plan cost on ₹10 lakh.</p>
    </div>
  );
}
