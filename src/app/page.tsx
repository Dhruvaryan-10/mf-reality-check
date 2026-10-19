import { ArrowDown, ArrowUpRight, BookOpen, CalendarClock, LineChart, Lock, Search } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/charts/Sparkline";
import { HeroCalculator } from "@/components/home/HeroCalculator";
import { ScrollStory, type StoryPoint } from "@/components/home/ScrollStory";
import { MagicCard } from "@/components/motion/MagicCard";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollTextReveal } from "@/components/motion/ScrollTextReveal";
import { SplitText } from "@/components/motion/SplitText";
import { Spotlight } from "@/components/motion/Spotlight";
import { ButtonLink } from "@/components/site/Button";
import { BENCHMARK_SLUG, getCategories, getDirectVsRegular, getFund, getFunds, getSeries } from "@/lib/data";
import { CATEGORY_LABEL, monthYear, pct, rupeesShort } from "@/lib/format";

function storyPoints(directCode: string, regularCode: string, start: string, amount: number): StoryPoint[] {
  const d = getSeries(directCode).weekly.filter((p) => p.nav && p.date >= start);
  const rByDate = new Map(getSeries(regularCode).weekly.filter((p) => p.nav).map((p) => [p.date, p.nav as number]));
  const aligned = d.filter((p) => rByDate.has(p.date));
  const d0 = aligned[0].nav as number;
  const r0 = rByDate.get(aligned[0].date)!;
  const pts = aligned.map((p) => ({ date: p.date, direct: (amount * (p.nav as number)) / d0, regular: (amount * rByDate.get(p.date)!) / r0 }));
  const step = Math.max(1, Math.floor(pts.length / 170));
  const out = pts.filter((_, i) => i % step === 0);
  if (out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1]);
  return out;
}

export default function Home() {
  const dvr = getDirectVsRegular();
  const funds = getFunds();
  const top = getFund(funds.find((f) => f.name === dvr[0].fund_name)!.slug)!;
  const points = storyPoints(top.direct.scheme_code, top.regular.scheme_code, dvr[0].start_date, 1_000_000);
  const index = getFund(BENCHMARK_SLUG);
  const cats = getCategories();
  const avgLost = dvr.reduce((s, r) => s + r.rupees_lost, 0) / dvr.length;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <Spotlight />
        <div className="relative mx-auto grid max-w-page items-center gap-12 px-5 pb-16 pt-32 sm:px-8 sm:pt-40 lg:min-h-[100svh] lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-24">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-sm text-fg-2">
                <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_10px_2px_rgba(61,220,151,0.6)]" aria-hidden="true" />
                Real NAV data, {monthYear(dvr[0].start_date)} to {monthYear(points[points.length - 1].date)}
              </p>
            </Reveal>
            <SplitText
              text="The fee you never see."
              delay={0.15}
              className="mt-6 font-display text-[clamp(3rem,7.4vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
            <Reveal delay={0.55}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-2 sm:text-xl">
                Two people buy the same mutual fund on the same day. One goes through an agent. This site shows, with 13
                years of real prices, how far apart they end up, and everything else a first-time investor should know.
              </p>
            </Reveal>
            <Reveal delay={0.7} className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="#story" variant="shimmer">
                Watch the gap grow <ArrowDown className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/funds" variant="ghost">
                <Search className="h-4 w-4" /> Look up a fund
              </ButtonLink>
            </Reveal>
          </div>
          <HeroCalculator rows={dvr} />
        </div>
      </section>

      {/* ---------- Ticker ---------- */}
      <section aria-label="Every fund's return over the last year" className="border-y border-line bg-ink-950/60 py-4">
        <Marquee>
          {funds.map((f) => {
            const r = f.direct.cagr_1y ?? 0;
            return (
              <Link key={f.slug} href={`/funds/${f.slug}`} className="mx-6 flex items-center gap-3 whitespace-nowrap text-sm">
                <span className="text-fg-2">{f.name}</span>
                <span className={`tnum font-semibold ${r >= 0 ? "text-mint" : "text-regular"}`}>
                  {r >= 0 ? "▲" : "▼"} {pct(r)}
                </span>
              </Link>
            );
          })}
        </Marquee>
        <p className="sr-only">One-year return of each fund&apos;s Direct plan.</p>
      </section>

      {/* ---------- Scroll story ---------- */}
      <ScrollStory fund={top.name} points={points} gapPerYear={dvr[0].yearly_gap} />

      {/* ---------- Statement ---------- */}
      <section className="mx-auto max-w-page px-5 py-28 sm:px-8 sm:py-40">
        <ScrollTextReveal
          className="max-w-5xl font-display text-[clamp(1.9rem,4.6vw,3.6rem)] font-medium leading-[1.12] tracking-tight text-fg"
          text={`Across all ${dvr.length} funds, choosing Regular over Direct cost ${rupeesShort(avgLost)} on every ₹10 lakh. That's the part of investing you control. Picking the next star fund isn't.`}
        />
      </section>

      {/* ---------- Chapters ---------- */}
      <section className="mx-auto max-w-page px-5 pb-10 sm:px-8">
        <Reveal>
          <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.02]">Start anywhere</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <Link href="/learn" className="block h-full">
              <MagicCard className="h-full">
                <div className="flex h-full flex-col justify-between gap-10 p-7 sm:p-9">
                  <div className="flex items-start justify-between">
                    <BookOpen className="h-6 w-6 text-direct" />
                    <ArrowUpRight className="h-5 w-5 text-fg-3 transition group-hover:text-fg" />
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-semibold">Learn the seven ideas</h3>
                    <p className="mt-3 max-w-lg text-fg-2">
                      NAV, Direct vs Regular, index funds, SIP, CAGR, rolling returns and drawdowns. Each one shown on real
                      prices, in plain English.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["NAV", "Direct vs Regular", "Index fund", "SIP", "CAGR", "Rolling returns", "Drawdown"].map((t) => (
                      <span key={t} className="rounded-full border border-line px-3 py-1 text-sm text-fg-2">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </MagicCard>
            </Link>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.08}>
            <Link href="/sip" className="block h-full">
              <MagicCard className="h-full" glow="61,220,151">
                <div className="flex h-full flex-col justify-between gap-8 p-7">
                  <div className="flex items-start justify-between">
                    <CalendarClock className="h-6 w-6 text-mint" />
                    <ArrowUpRight className="h-5 w-5 text-fg-3 transition group-hover:text-fg" />
                  </div>
                  <div>
                    <p className="tnum font-display text-4xl font-semibold">{index && rupeesShort(index.direct.sip_value)}</p>
                    <p className="mt-1 text-sm text-fg-3">from ₹5,000 a month in the index fund since 2016</p>
                  </div>
                  <h3 className="font-display text-2xl font-semibold">Try a SIP on real prices</h3>
                </div>
              </MagicCard>
            </Link>
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.05}>
            <Link href="/funds" className="block h-full">
              <MagicCard className="h-full">
                <div className="flex h-full flex-col gap-6 p-7">
                  <div className="flex items-start justify-between">
                    <LineChart className="h-6 w-6 text-direct" />
                    <ArrowUpRight className="h-5 w-5 text-fg-3 transition group-hover:text-fg" />
                  </div>
                  <div className="h-16">{index && <Sparkline values={index.spark} />}</div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{funds.length} funds, every number</h3>
                    <p className="mt-2 text-fg-2">Growth, falls and every 5-year window, next to the Nifty 50.</p>
                  </div>
                </div>
              </MagicCard>
            </Link>
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.1}>
            <Link href="/insights" className="block h-full">
              <MagicCard className="h-full" glow="226,93,44">
                <div className="flex h-full flex-col gap-6 p-7">
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-fg-3">Typical 5-year return</span>
                    <ArrowUpRight className="h-5 w-5 text-fg-3 transition group-hover:text-fg" />
                  </div>
                  <ul className="space-y-2">
                    {cats.map((c) => (
                      <li key={c.category} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-3 text-sm">
                        <span className="text-fg-2">{CATEGORY_LABEL[c.category]}</span>
                        <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <span className="block h-full rounded-full bg-gradient-to-r from-direct to-[#8fb6ff]" style={{ width: `${(c.median_roll5 / 0.25) * 100}%` }} />
                        </span>
                        <span className="tnum text-right">{pct(c.median_roll5)}</span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">What the data really says</h3>
                    <p className="mt-2 text-fg-2">Timing, risk, and the bias hiding in every “top funds” list.</p>
                  </div>
                </div>
              </MagicCard>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- Members ---------- */}
      <section className="mx-auto max-w-page px-5 py-24 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-ink-850 px-7 py-14 sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(76,141,255,0.28),transparent)]" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-48 left-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(226,93,44,0.18),transparent)]" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <p className="flex items-center gap-2 text-sm text-fg-2">
                <Lock className="h-4 w-4" /> Free account
              </p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.02]">
                What are your own funds costing you?
              </h2>
              <p className="mt-5 text-lg text-fg-2">
                Add the funds you hold and when you bought them. See what the Regular plan has cost you so far, keep a
                watchlist, save SIP plans and compare funds side by side.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/dashboard" variant="shimmer">
                  Check my portfolio
                </ButtonLink>
                <ButtonLink href="/compare" variant="ghost">
                  Compare funds
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
