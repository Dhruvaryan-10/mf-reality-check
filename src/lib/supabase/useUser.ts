"use client";
// The signed-in user (or null), kept up to date as people sign in and out.
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "./client";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, ready };
}
