import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { SipSimulator } from "@/components/sip/SipSimulator";
import { BENCHMARK_SLUG, getFundOptions } from "@/lib/data";

export const metadata: Metadata = { title: "SIP simulator" };

export default function SipPage() {
  return (
    <>
      <PageHeader
        title="Try a monthly SIP on real past prices."
        lede="Pick a fund, an amount and a start year. Units are bought in the first trading week of every month at that week's actual NAV, exactly as a real SIP would have."
      />
      <Suspense>
        <SipSimulator funds={getFundOptions()} indexSlug={BENCHMARK_SLUG} />
      </Suspense>
    </>
  );
}
