import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/members/AuthForm";
import { SetupNotice } from "@/components/members/SetupNotice";
import { Odometer } from "@/components/motion/Odometer";
import { getDirectVsRegular } from "@/lib/data";
import { rupeesShort } from "@/lib/format";
import { authEnabled } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const dvr = getDirectVsRegular();
  const avg = dvr.reduce((s, r) => s + r.rupees_lost, 0) / dvr.length;

  if (!authEnabled) {
    return (
      <div className="px-5 pb-10 pt-36 sm:px-8">
        <SetupNotice />
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[100svh] max-w-page items-center gap-10 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-2 lg:gap-16">
      <div className="mx-auto w-full max-w-md">
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
      <div className="relative hidden h-[560px] overflow-hidden rounded-[2rem] border border-line bg-ink-850 lg:block">
        <div className="dot-grid absolute inset-0" aria-hidden="true" />
        <div className="absolute -left-20 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(76,141,255,0.35),transparent)]" aria-hidden="true" />
        <div className="absolute -bottom-24 right-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,rgba(226,93,44,0.25),transparent)]" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-end p-10">
          <p className="text-fg-2">On average, the Regular plan cost</p>
          <p className="mt-2 font-display text-7xl font-semibold leading-none">
            <Odometer value={rupeesShort(avg)} />
          </p>
          <p className="mt-3 max-w-sm text-lg text-fg-2">
            on every ₹10 lakh invested in 2013. Sign in to see what your own funds are costing you.
          </p>
        </div>
      </div>
    </div>
  );
}
