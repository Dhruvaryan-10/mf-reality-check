import type { Metadata } from "next";
import { Suspense } from "react";
import { Dashboard } from "@/components/members/Dashboard";
import { SetupNotice } from "@/components/members/SetupNotice";
import { getFundLites } from "@/lib/data";
import { authEnabled } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Your dashboard" };

export default function DashboardPage() {
  return (
    <div className="pb-10 pt-32 sm:pt-40">
      {authEnabled ? (
        <Suspense>
          <Dashboard funds={getFundLites()} />
        </Suspense>
      ) : (
        <div className="px-5 sm:px-8">
          <SetupNotice />
        </div>
      )}
    </div>
  );
}
