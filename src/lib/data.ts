// Server-side data loading. Reads the JSON files the Python analysis produced
// (copied into public/data by scripts/copy-data.mjs) at build/request time.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { slugify } from "./format";
import type { CategoryRow, DirectVsRegular, Fund, FundSeries, FundSummary } from "./types";

const DATA_DIR = join(process.cwd(), "public", "data");
export const BENCHMARK = "UTI Nifty 50 Index";
export const BENCHMARK_SLUG = slugify(BENCHMARK);

function read<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8")) as T;
}

export const getSummary = cache(() => read<FundSummary[]>("summary.json"));
export const getCategories = cache(() => read<CategoryRow[]>("categories.json"));
export const getDirectVsRegular = cache(() => read<DirectVsRegular[]>("direct_vs_regular.json"));
export const getSeries = cache((code: string) => read<FundSeries>(`funds/${code}.json`));

function sparkline(code: string, points = 60) {
  const navs = getSeries(code)
    .weekly.map((p) => p.nav)
    .filter((n): n is number => n != null);
  const step = Math.max(1, Math.floor(navs.length / points));
  const out = navs.filter((_, i) => i % step === 0);
  if (out[out.length - 1] !== navs[navs.length - 1]) out.push(navs[navs.length - 1]);
  return out.map((n) => +n.toFixed(3));
}

/** Every fund with both plans, its Direct-vs-Regular row and a sparkline. */
export const getFunds = cache((): Fund[] => {
  const summary = getSummary();
  const dvr = getDirectVsRegular();
  const names = [...new Set(summary.map((r) => r.fund_name))];
  return names
    .map((name) => {
      const direct = summary.find((r) => r.fund_name === name && r.plan === "direct");
      const regular = summary.find((r) => r.fund_name === name && r.plan === "regular");
      if (!direct || !regular) return null;
      return {
        slug: slugify(name),
        name,
        category: direct.category,
        direct,
        regular,
        dvr: dvr.find((d) => d.fund_name === name) ?? null,
        spark: sparkline(direct.scheme_code),
      } satisfies Fund;
    })
    .filter((f): f is Fund => f !== null);
});

export const getFund = (slug: string) => getFunds().find((f) => f.slug === slug) ?? null;

/** Small list for pickers in client components (no heavy data). */
export const getFundOptions = cache(() =>
  getFunds().map((f) => ({
    slug: f.slug,
    name: f.name,
    category: f.category,
    directCode: f.direct.scheme_code,
    regularCode: f.regular.scheme_code,
  }))
);

export type FundOption = ReturnType<typeof getFundOptions>[number];

export const getLastDate = cache(() => getSummary().reduce((m, r) => (r.last_date > m ? r.last_date : m), ""));

/** What member pages need for every fund: names, codes, sparkline and headline numbers. */
export const getFundLites = cache(() =>
  getFunds().map((f) => ({
    slug: f.slug,
    name: f.name,
    category: f.category,
    directCode: f.direct.scheme_code,
    regularCode: f.regular.scheme_code,
    spark: f.spark,
    cagr5: f.direct.cagr_5y,
    roll5: f.direct.roll5_median,
    roll5min: f.direct.roll5_min,
    fall: f.direct.max_drawdown,
    volatility: f.direct.volatility,
    sip: f.direct.sip_value,
    directCagr: f.dvr?.direct_cagr ?? null,
    regularCagr: f.dvr?.regular_cagr ?? null,
    lostPer10L: f.dvr?.rupees_lost ?? null,
  }))
);

export type FundLite = ReturnType<typeof getFundLites>[number];
