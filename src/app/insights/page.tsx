import type { Metadata } from "next";
import { TimingChart } from "@/components/insights/TimingChart";
import { Odometer } from "@/components/motion/Odometer";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { BENCHMARK, BENCHMARK_SLUG, getCategories, getFund, getFunds, getSeries } from "@/lib/data";
import { CATEGORY_LABEL, CATEGORY_ORDER, monthYear, pct } from "@/lib/format";
import { getLearnData } from "@/lib/learnData";

export const metadata: Metadata = { title: "Insights" };

// From S&P Dow Jones Indices, SPIVA India Year-End 2025 Scorecard (data to 31 Dec 2025)
const SPIVA = {
  url: "https://www.spglobal.com/spdji/en/spiva/article/spiva-india-year-end-2025/",
  largeCapUnder5y: 0.844,
  largeCapUnder10y: 0.763,
  notSurvived10y: 0.27,
};

export default function InsightsPage() {
  const d = getLearnData();
  const index = getFund(BENCHMARK_SLUG)!;
  const cats = CATEGORY_ORDER.map((c) => getCategories().find((x) => x.category === c)).filter((c): c is NonNullable<typeof c> => !!c);
  const large = getFunds().filter((f) => f.category === "large_cap" && f.direct.roll5_beat_index != null);
  const ours = large.reduce((s, f) => s + (f.direct.roll5_beat_index ?? 0), 0) / large.length;

  // When did the latest 5-year period begin, and was the market near a high then?
  const weekly = getSeries(index.direct.scheme_code).weekly;
  const last = weekly[weekly.length - 1].date;
  const startIso = `${Number(last.slice(0, 4)) - 5}${last.slice(4)}`;
  const startPoint = weekly.find((p) => p.date >= startIso);
  const nearHigh = (startPoint?.drawdown ?? -1) > -0.03;
  const rolls = weekly.map((p) => p.roll5).filter((v): v is number => v != null);
  const worseThan = rolls.filter((v) => v > rolls[rolls.length - 1]).length / rolls.length;
  const falls = cats.map((c) => c.avg_max_drawdown);

  return (
    <>
      <PageHeader
        title="What 13 years of prices actually say."
        lede="Three findings that change how you should read any fund's numbers, and the catch hiding in every “top funds” list, including ours."
      />

      <Section id="timing">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,4.2vw,3.2rem)] font-semibold leading-[1.04]">When you check changes the answer.</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-fg-2">
              <p>
                Over the last five years the Nifty 50 index fund earned <strong className="text-fg">{pct(index.direct.cagr_5y)} a year</strong>.
                {nearHigh && ` That period began in ${monthYear(startIso)}, with the market close to a record high: an unlucky starting point.`}
              </p>
              <p>
                Across all {rolls.length} five-year periods since 2013 (one per week), the typical one earned{" "}
                <strong className="text-fg">{pct(index.direct.roll5_median)}</strong>. The latest was worse than {pct(worseThan, 0)} of them.
              </p>
              <p className="text-fg-3">So one return figure on an advert tells you very little. Always ask: measured from when?</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-line bg-ink-850/70 p-4 sm:p-6">
              <TimingChart bins={d.rolling.bins} highlight={d.rolling.latestBin} />
              <p className="mt-3 text-sm text-fg-3">Yearly return of every 5-year period, {BENCHMARK} (Direct). Orange holds the most recent one.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="risk">
        <Reveal>
          <h2 className="max-w-3xl font-display text-[clamp(2rem,4.2vw,3.2rem)] font-semibold leading-[1.04]">Small caps earned the most, and fell the furthest.</h2>
          <p className="mt-5 max-w-2xl text-lg text-fg-2">
            Averages by type of fund, Direct plans, since 2013. Every type dropped between {pct(Math.max(...falls), 0)} and {pct(Math.min(...falls), 0)} at some point. No kind of equity fund protects you from a crash.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 overflow-x-auto rounded-3xl border border-line">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-white/[0.03] text-sm text-fg-3">
                <tr>
                  <th className="px-5 py-4 font-medium">Type of fund</th>
                  <th className="px-5 py-4 text-right font-medium">Funds</th>
                  <th className="px-5 py-4 font-medium">Typical 5-year return</th>
                  <th className="px-5 py-4 font-medium">Average worst fall</th>
                  <th className="px-5 py-4 text-right font-medium">SIP yearly return</th>
                  <th className="px-5 py-4 text-right font-medium">Periods beating Nifty 50*</th>
                </tr>
              </thead>
              <tbody className="tnum">
                {cats.map((c) => (
                  <tr key={c.category} className="border-t border-line">
                    <th className="px-5 py-4 font-semibold">{CATEGORY_LABEL[c.category]}</th>
                    <td className="px-5 py-4 text-right text-fg-2">{c.funds}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-28 overflow-hidden rounded-full bg-white/[0.06]">
                          <span className="block h-full rounded-full bg-direct" style={{ width: `${(c.median_roll5 / 0.25) * 100}%` }} />
                        </span>
                        {pct(c.median_roll5)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-28 overflow-hidden rounded-full bg-white/[0.06]">
                          <span className="block h-full rounded-full bg-regular" style={{ width: `${(Math.abs(c.avg_max_drawdown) / 0.5) * 100}%` }} />
                        </span>
                        {pct(c.avg_max_drawdown)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">{pct(c.avg_sip_xirr)}</td>
                    <td className="px-5 py-4 text-right">{c.category === "index" ? "–" : pct(c.avg_roll5_beat_index, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-sm text-fg-3">
            *Compared with {BENCHMARK}, which holds India&apos;s 50 biggest companies. For mid- and small-cap funds this mostly shows that smaller companies did better than big ones after 2013, not that their managers were more skilled.
          </p>
        </Reveal>
      </Section>

      <Section id="catch">
        <Reveal>
          <h2 className="max-w-3xl font-display text-[clamp(2rem,4.2vw,3.2rem)] font-semibold leading-[1.04]">The catch: this site only studies winners.</h2>
          <p className="mt-5 max-w-2xl text-lg text-fg-2">Look up a fund here and active managers often seem to beat the index. That conclusion is wrong, and why is the most useful lesson on this site.</p>
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2">
          <Reveal className="bg-ink-850 p-8 sm:p-10">
            <p className="font-display text-[clamp(3.5rem,9vw,6.5rem)] font-semibold leading-none text-direct">
              <Odometer value={pct(ours, 0)} />
            </p>
            <p className="mt-5 max-w-sm text-lg text-fg-2">of 5-year periods in which our {large.length} popular large-cap funds beat the Nifty 50 index fund.</p>
          </Reveal>
          <Reveal className="bg-ink-850 p-8 sm:p-10" delay={0.1}>
            <p className="font-display text-[clamp(3.5rem,9vw,6.5rem)] font-semibold leading-none text-regular">
              <Odometer value={pct(SPIVA.largeCapUnder5y, 0)} />
            </p>
            <p className="mt-5 max-w-sm text-lg text-fg-2">
              of <em>all</em> Indian large-cap funds did worse than their benchmark over the 5 years to December 2025 ({pct(SPIVA.largeCapUnder10y, 0)} over 10 years).
            </p>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <Reveal>
            <h3 className="font-display text-2xl font-semibold">We picked today&apos;s famous funds.</h3>
            <p className="mt-3 text-lg leading-relaxed text-fg-2">
              They&apos;re famous because they did well. Judging fund managers by them is like judging cricket coaching by studying only players who made the Indian team. That&apos;s <em>selection bias</em>.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="font-display text-2xl font-semibold">Losers disappear from the data.</h3>
            <p className="mt-3 text-lg leading-relaxed text-fg-2">
              Funds that did badly get merged or shut down, and their records vanish. Over ten years, {pct(SPIVA.notSurvived10y, 0)} of Indian funds didn&apos;t survive. That&apos;s <em>survivorship bias</em>.
            </p>
          </Reveal>
        </div>
        <Reveal>
          <p className="mt-12 max-w-3xl font-display text-2xl font-medium leading-snug text-fg">
            The honest takeaway: picking a winning fund is far easier in hindsight than in advance. The plan you choose and the fee you pay are the parts you control.
          </p>
          <p className="mt-6 text-sm text-fg-3">
            Source:{" "}
            <a href={SPIVA.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-fg">
              S&amp;P Dow Jones Indices, SPIVA India Year-End 2025 Scorecard
            </a>
            . The two figures measure slightly different things (different benchmarks and periods), but they point in opposite directions.
          </p>
        </Reveal>
      </Section>

      <Section id="method">
        <Reveal>
          <div className="rounded-3xl border border-line bg-ink-850/60 p-8 sm:p-10">
            <h2 className="font-display text-2xl font-semibold">How this was made</h2>
            <div className="mt-5 grid gap-6 text-fg-2 md:grid-cols-2">
              <p>
                Daily NAVs for {getFunds().length} funds, both plans, from mfapi.in (which republishes AMFI data). Cleaned and analysed in Python with pandas and DuckDB (SQL), then built into this site with Next.js, Framer Motion and ECharts.
              </p>
              <p>
                Everything starts in January 2013, when Direct plans were introduced, so both plans are compared over the same years. Rolling returns use every weekly start date. Returns ignore taxes and exit loads. For learning only, not investment advice.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
