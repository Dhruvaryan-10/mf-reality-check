// Precomputes the small datasets the Learn page visuals need (runs on the server at build time).
import { BENCHMARK_SLUG, getDirectVsRegular, getFund, getFunds, getSeries } from "./data";
import { runSip } from "./finance";
import { fullDate, monthYear, pct, rupeesShort } from "./format";

function thin<T>(arr: T[], n = 90) {
  const step = Math.max(1, Math.floor(arr.length / n));
  const out = arr.filter((_, i) => i % step === 0);
  if (out[out.length - 1] !== arr[arr.length - 1]) out.push(arr[arr.length - 1]);
  return out;
}

export function getLearnData() {
  const index = getFund(BENCHMARK_SLUG)!;
  const weekly = getSeries(index.direct.scheme_code).weekly.filter((p) => p.nav != null);
  const navs = weekly.map((p) => p.nav as number);

  // Direct vs Regular: the fund with both plans launched the same day, else the first fund
  const funds = getFunds();
  const twin = funds.find((f) => f.direct.first_date === f.regular.first_date && f.category !== "index") ?? funds[0];
  const tD = getSeries(twin.direct.scheme_code).weekly.filter((p) => p.nav != null);
  const tRmap = new Map(getSeries(twin.regular.scheme_code).weekly.filter((p) => p.nav != null).map((p) => [p.date, p.nav as number]));
  const tAligned = tD.filter((p) => tRmap.has(p.date));

  const sip = runSip(getSeries(index.direct.scheme_code).weekly, 5000, "2016-01-01")!;

  // Steady-growth curve with the same start and end as the real NAV
  const years = (+new Date(weekly[weekly.length - 1].date) - +new Date(weekly[0].date)) / (365.25 * 864e5);
  const cagr = (navs[navs.length - 1] / navs[0]) ** (1 / years) - 1;
  const smooth = weekly.map((p) => navs[0] * (1 + cagr) ** ((+new Date(p.date) - +new Date(weekly[0].date)) / (365.25 * 864e5)));

  // Histogram of every 5-year window
  const rolls = weekly.map((p) => p.roll5).filter((v): v is number => v != null);
  const BIN = 0.02;
  const lo = Math.floor(Math.min(...rolls) / BIN) * BIN;
  const hi = Math.ceil(Math.max(...rolls) / BIN) * BIN;
  const bins: { label: string; value: number; from: number }[] = [];
  for (let b = lo; b < hi - 1e-9; b += BIN) bins.push({ label: pct(b, 0), value: 0, from: b });
  rolls.forEach((v) => bins[Math.min(bins.length - 1, Math.floor((v - lo) / BIN + 1e-9))].value++);
  const latest = rolls[rolls.length - 1];
  const latestBin = bins.findIndex((b) => latest >= b.from && latest < b.from + BIN + 1e-9);

  const best = getDirectVsRegular().reduce((a, b) => (b.direct_cagr > a.direct_cagr ? b : a));

  return {
    nav: {
      values: thin(navs),
      first: navs[0],
      last: navs[navs.length - 1],
      firstDate: monthYear(weekly[0].date),
      lastDate: fullDate(weekly[weekly.length - 1].date),
      fund: index.name,
    },
    twin: {
      fund: twin.name,
      since: monthYear(twin.direct.first_date),
      direct: thin(tAligned.map((p) => p.nav as number)),
      regular: thin(tAligned.map((p) => tRmap.get(p.date)!)),
      directNav: twin.direct.latest_nav,
      regularNav: twin.regular.latest_nav,
    },
    index: { cagr: index.direct.cagr_since_2013, since: monthYear(index.direct.first_date) },
    sip: {
      value: thin(sip.path.map((p) => p.value)),
      invested: thin(sip.path.map((p) => p.invested)),
      total: sip.value,
      put: sip.invested,
    },
    cagr: {
      real: thin(navs),
      smooth: thin(smooth),
      rate: cagr,
      example: `${best.fund_name} (Direct): ₹10 lakh in ${monthYear(best.start_date)} became ${rupeesShort(best.direct_value)} after ${best.years} years. As a steady yearly rate, that's ${pct(best.direct_cagr)}.`,
    },
    rolling: {
      bins: bins.map(({ label, value }) => ({ label, value })),
      latestBin,
      median: index.direct.roll5_median,
      last5: index.direct.cagr_5y,
    },
    drawdown: {
      values: thin(weekly.map((p) => p.drawdown ?? 0), 160),
      worst: index.direct.max_drawdown,
      covid: index.direct.covid_drop,
    },
  };
}

export type LearnData = ReturnType<typeof getLearnData>;
