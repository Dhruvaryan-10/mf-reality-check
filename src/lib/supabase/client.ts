"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, authEnabled } from "./config";

let client: SupabaseClient | null = null;

/** The Supabase client for the browser, or null when login isn't set up. */
export function getBrowserSupabase() {
  if (!authEnabled) return null;
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
