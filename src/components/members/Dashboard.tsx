"use client";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Segmented } from "@/components/motion/Segmented";
import { SplitText } from "@/components/motion/SplitText";
import type { FundLite } from "@/lib/data";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";
import { Portfolio } from "./Portfolio";
import { SavedSips } from "./SavedSips";
import { Watchlist } from "./Watchlist";

type Tab = "portfolio" | "watchlist" | "sips";

export function Dashboard({ funds }: { funds: FundLite[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("tab");
  const [tab, setTab] = useState<Tab>(initial === "watchlist" || initial === "sips" ? initial : "portfolio");
  const { user, ready } = useUser();

  async function signOut() {
    await getBrowserSupabase()?.auth.signOut();
    window.location.assign("/");
  }

  if (!ready) return <div className="mx-auto h-96 max-w-page animate-pulse rounded-3xl bg-white/[0.02]" />;
  if (!user)
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-fg-2">Please sign in to see your dashboard.</p>
        <Link href="/login?next=/dashboard" className="mt-5 inline-flex rounded-full bg-fg px-5 py-2.5 font-semibold text-ink-900">
          Sign in
        </Link>
      </div>
    );

  const name = user.email?.split("@")[0] ?? "there";

  return (
    <div className="mx-auto max-w-page px-5 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-fg-3">{user.email}</p>
          <SplitText text={`Hi ${name}.`} className="mt-2 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-none" />
        </div>
        <button onClick={signOut} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg-2 hover:border-white/30 hover:text-fg">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      <div className="mt-10 overflow-x-auto">
        <Segmented
          id="dash-tab"
          label="Dashboard section"
          value={tab}
          onChange={(t) => {
            setTab(t);
            router.replace(`/dashboard?tab=${t}`, { scroll: false });
          }}
          options={[
            { value: "portfolio", label: "My portfolio" },
            { value: "watchlist", label: "Watchlist" },
            { value: "sips", label: "Saved SIPs" },
          ]}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} className="mt-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {tab === "portfolio" && <Portfolio funds={funds} />}
          {tab === "watchlist" && <Watchlist funds={funds} />}
          {tab === "sips" && <SavedSips funds={funds} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
