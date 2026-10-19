import type { Metadata } from "next";
import { FundsBrowser } from "@/components/funds/FundsBrowser";
import { PageHeader } from "@/components/site/PageHeader";
import { getFunds } from "@/lib/data";

export const metadata: Metadata = { title: "All funds" };

export default function FundsPage() {
  const funds = getFunds();
  return (
    <>
      <PageHeader
        title="Every fund, every number."
        lede={`${funds.length} well-known funds across five types. Open one to see how it really behaved since 2013, next to the Nifty 50 index fund.`}
      />
      <FundsBrowser funds={funds} />
    </>
  );
}
