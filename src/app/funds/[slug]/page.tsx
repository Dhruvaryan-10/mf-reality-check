import { ArrowLeft, GitCompare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FundDetail } from "@/components/funds/FundDetail";
import { WatchButton } from "@/components/members/WatchButton";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { BENCHMARK_SLUG, getFund, getFunds } from "@/lib/data";
import { CATEGORY_BLURB, CATEGORY_LABEL, pct } from "@/lib/format";

export function generateStaticParams() {
  return getFunds().map((f) => ({ slug: f.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const f = getFund(params.slug);
  return { title: f ? f.name : "Fund not found" };
}

export default function FundPage({ params }: { params: { slug: string } }) {
  const fund = getFund(params.slug);
  if (!fund) notFound();
  const index = getFund(BENCHMARK_SLUG)!;
  const similar = getFunds().filter((f) => f.category === fund.category && f.slug !== fund.slug);

  return (
    <>
      <header className="relative mx-auto max-w-page px-5 pb-10 pt-32 sm:px-8 sm:pt-40">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <Link href="/funds" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-fg">
          <ArrowLeft className="h-4 w-4" /> All funds
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <p className="inline-flex rounded-full border border-line px-3 py-1 text-sm text-fg-2">{CATEGORY_LABEL[fund.category]}</p>
            </Reveal>
            <SplitText text={fund.name} className="mt-4 font-display text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[1.02]" />
            <Reveal delay={0.3}>
              <p className="mt-3 text-lg text-fg-2">
                {CATEGORY_BLURB[fund.category]} Grew {pct(fund.direct.cagr_since_2013)} a year (Direct) since 2013.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.4} className="flex flex-wrap gap-2">
            <WatchButton slug={fund.slug} />
            <Link href={`/compare?funds=${fund.slug}`} prefetch={false} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg-2 transition hover:border-white/30 hover:text-fg">
              <GitCompare className="h-4 w-4" /> Compare
            </Link>
          </Reveal>
        </div>
      </header>

      <FundDetail
        fund={fund}
        isIndex={fund.slug === BENCHMARK_SLUG}
        indexCodes={{ direct: index.direct.scheme_code, regular: index.regular.scheme_code }}
      />

      {similar.length > 0 && (
        <section className="mx-auto mt-16 max-w-page px-5 sm:px-8" aria-labelledby="similar-title">
          <h2 id="similar-title" className="font-display text-2xl font-semibold">
            Other {CATEGORY_LABEL[fund.category].toLowerCase()} funds
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {similar.map((f) => (
              <li key={f.slug}>
                <Link href={`/funds/${f.slug}`} className="inline-flex items-center gap-3 rounded-full border border-line px-4 py-2 text-sm transition hover:border-white/30 hover:bg-white/[0.04]">
                  {f.name}
                  <span className="tnum text-fg-3">{pct(f.direct.roll5_median)} typical</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
