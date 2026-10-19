import type { Metadata } from "next";
import { LearnScroller } from "@/components/learn/LearnScroller";
import { ButtonLink } from "@/components/site/Button";
import { PageHeader } from "@/components/site/PageHeader";
import { getLearnData } from "@/lib/learnData";

export const metadata: Metadata = { title: "Learn the basics" };

export default function LearnPage() {
  const d = getLearnData();
  return (
    <>
      <PageHeader
        title="Seven ideas, and you can read any fund factsheet."
        lede="Mutual fund jargon makes simple things sound hard. Scroll through each idea; the chart beside it uses real prices."
      />
      <LearnScroller d={d} />
      <div className="mx-auto mt-10 flex max-w-page flex-wrap gap-3 px-5 sm:px-8">
        <ButtonLink href="/funds" variant="shimmer">
          Now look up a fund
        </ButtonLink>
        <ButtonLink href="/sip" variant="ghost">
          Try a SIP
        </ButtonLink>
      </div>
    </>
  );
}
