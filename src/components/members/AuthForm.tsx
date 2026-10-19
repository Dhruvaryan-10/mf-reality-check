"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Segmented } from "@/components/motion/Segmented";
import { Button } from "@/components/site/Button";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

type Mode = "signin" | "signup";

export function AuthForm() {
  const params = useSearchParams();
  const nextParam = params.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") === "link" ? "That sign-in link has expired or was already used. Please sign in again." : "");
  const [sent, setSent] = useState(false);
  const [googleOn, setGoogleOn] = useState(false);

  // Only show "Continue with Google" if Google is switched on in Supabase
  useEffect(() => {
    fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setGoogleOn(Boolean(s?.external?.google)))
      .catch(() => setGoogleOn(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
      // Full page load so the server sees the new session cookie (avoids a stale prefetched redirect)
      else window.location.assign(next);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) setError(error.message);
      else if (data.session) window.location.assign(next);
      else setSent(true);
    }
    setBusy(false);
  }

  async function google() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setError("Google sign-in isn't enabled for this project yet. Use email instead, or see SETUP.md.");
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Mail className="mx-auto h-10 w-10 text-direct" />
        <h2 className="mt-5 font-display text-3xl font-semibold">Check your inbox</h2>
        <p className="mt-3 text-fg-2">
          We sent a confirmation link to <strong className="text-fg">{email}</strong>. Open it on this device to finish creating your account.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <Segmented
        id="auth-mode"
        label="Sign in or create account"
        value={mode}
        onChange={(m) => (setMode(m), setError(""))}
        options={[
          { value: "signin", label: "Sign in" },
          { value: "signup", label: "Create account" },
        ]}
      />
      <AnimatePresence mode="wait">
        <motion.h1
          key={mode}
          className="mt-8 font-display text-[2.4rem] font-semibold leading-none"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {mode === "signin" ? "Welcome back" : "Create your free account"}
        </motion.h1>
      </AnimatePresence>
      <p className="mt-3 text-fg-2">Track your own funds, keep a watchlist, save SIP plans and compare funds.</p>
      {!googleOn && <div className="mt-8" />}

      {googleOn && (
        <>
        <button
          type="button"
          onClick={google}
          className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-white/[0.03] font-medium transition hover:border-white/30 hover:bg-white/[0.06]"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-4 text-sm text-fg-3">
          <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
        </div>
        </>
      )}

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-fg-2">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-line bg-white/[0.03] px-4 text-fg placeholder:text-fg-3 focus:border-direct/60 focus:outline-none"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-fg-2">Password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-line bg-white/[0.03] px-4 text-fg focus:border-direct/60 focus:outline-none"
          />
          {mode === "signup" && <span className="mt-1.5 block text-xs text-fg-3">At least 6 characters.</span>}
        </label>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-regular" role="alert">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <Button type="submit" variant="shimmer" disabled={busy} className="h-12 w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
