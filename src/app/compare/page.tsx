import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareTool } from "@/components/members/CompareTool";
import { SetupNotice } from "@/components/members/SetupNotice";
import { PageHeader } from "@/components/site/PageHeader";
import { getFundLites } from "@/lib/data";
import { authEnabled } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Compare funds" };

export default function ComparePage() {
  return (
    <>
      <PageHeader title="Compare funds side by side." lede="Pick up to three funds. Same start date, same chart, every number in one table." />
      {authEnabled ? (
        <Suspense>
          <CompareTool funds={getFundLites()} />
        </Suspense>
      ) : (
        <div className="px-5 sm:px-8">
          <SetupNotice />
        </div>
      )}
    </>
  );
}
