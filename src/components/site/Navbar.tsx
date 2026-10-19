"use client";
// Floating navbar that tightens into a glass pill once you scroll
// (inspired by Aceternity "Resizable Navbar" / "Floating Navbar").
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Lock, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { authEnabled } from "@/lib/supabase/config";
import { useUser } from "@/lib/supabase/useUser";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/funds", label: "Funds" },
  { href: "/sip", label: "SIP" },
  { href: "/insights", label: "Insights" },
  { href: "/compare", label: "Compare", members: true },
];

export function Navbar() {
  const { user } = useUser();
  const email = user?.email ?? null;
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
      <motion.nav
        aria-label="Main"
        className={cn(
          "pointer-events-auto flex w-full items-center justify-between gap-4 rounded-full border px-3 py-2 transition-colors duration-300 sm:px-4",
          scrolled ? "glass border-line shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]" : "border-transparent"
        )}
        animate={{ maxWidth: scrolled ? 920 : 1200 }}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
      >
        <Link href="/" className="flex items-center gap-2.5 pl-1 font-display text-[1.05rem] font-semibold tracking-tight">
          <Logo />
          <span className="hidden sm:inline">Fund Reality</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = path === l.href || path.startsWith(`${l.href}/`);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  prefetch={l.members ? false : undefined}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.93rem] transition-colors",
                    active ? "text-fg" : "text-fg-2 hover:text-fg"
                  )}
                >
                  {active && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-white/[0.08]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                  )}
                  <span className="relative">{l.label}</span>
                  {l.members && !email && <Lock className="relative h-3.5 w-3.5 opacity-60" aria-label="members only" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {email ? (
            <Link href="/dashboard" prefetch={false} className="hidden items-center gap-2 rounded-full bg-fg px-4 py-2 text-[0.93rem] font-semibold text-ink-900 transition hover:bg-white sm:flex">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-900 text-[0.7rem] text-fg">{email[0]?.toUpperCase()}</span>
              Dashboard
            </Link>
          ) : (
            <Link
              href={authEnabled ? "/login" : "/dashboard"}
              className="hidden rounded-full bg-fg px-4 py-2 text-[0.93rem] font-semibold text-ink-900 transition hover:bg-white sm:block"
            >
              Sign in
            </Link>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="glass pointer-events-auto absolute inset-x-3 top-[4.25rem] rounded-3xl border border-line p-3 md:hidden"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="flex flex-col">
              {[...LINKS, email ? { href: "/dashboard", label: "Dashboard" } : { href: "/login", label: "Sign in" }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} prefetch={false} className="block rounded-2xl px-4 py-3 text-lg text-fg hover:bg-white/[0.06]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#10172a" stroke="rgba(148,163,184,0.25)" />
      <path d="M7 21l6-6 4 3 8-9" stroke="#4c8dff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 24l6-5 4 2 8-6" stroke="#e25d2c" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}
