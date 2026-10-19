"use client";
// Star a fund. Saved to the signed-in user's watchlist in Supabase.
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";

export function WatchButton({ slug }: { slug: string }) {
  const { user, ready } = useUser();
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    supabase
      .from("watchlist")
      .select("fund_slug")
      .eq("fund_slug", slug)
      .maybeSingle()
      .then(({ data }) => setOn(Boolean(data)));
  }, [user, slug]);

  if (!ready) return <span className="h-10 w-36" aria-hidden="true" />;

  if (!user) {
    return (
      <Link href={`/login?next=/funds/${slug}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg-2 transition hover:border-white/30 hover:text-fg">
        <Star className="h-4 w-4" /> Sign in to watch
      </Link>
    );
  }

  async function toggle() {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    setBusy(true);
    setError("");
    const next = !on;
    setOn(next); // optimistic
    const { error } = next
      ? await supabase.from("watchlist").insert({ fund_slug: slug })
      : await supabase.from("watchlist").delete().eq("fund_slug", slug);
    if (error) {
      setOn(!next);
      setError("Couldn't update your watchlist. Check the database is set up (see SETUP.md).");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={toggle}
        disabled={busy}
        aria-pressed={on}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
          on ? "border-amber-300/40 bg-amber-300/10 text-amber-200" : "border-line text-fg-2 hover:border-white/30 hover:text-fg"
        )}
      >
        <motion.span animate={on ? { rotate: [0, -20, 15, 0], scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.45 }}>
          <Star className={cn("h-4 w-4", on && "fill-amber-300 text-amber-300")} />
        </motion.span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(on)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {on ? "On your watchlist" : "Add to watchlist"}
          </motion.span>
        </AnimatePresence>
      </button>
      {error && <p className="text-xs text-regular">{error}</p>}
    </div>
  );
}
