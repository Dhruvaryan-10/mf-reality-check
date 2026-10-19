import { KeyRound } from "lucide-react";

/** Shown on member pages until Supabase keys are added to .env.local. */
export function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-ink-850 p-8 sm:p-10">
      <KeyRound className="h-7 w-7 text-direct" />
      <h2 className="mt-5 font-display text-3xl font-semibold">Sign-in isn&apos;t switched on yet</h2>
      <p className="mt-3 text-fg-2">Member features need a free Supabase project. It takes about five minutes:</p>
      <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-fg-2 marker:text-fg-3">
        <li>
          Create a free project at{" "}
          <a href="https://supabase.com" className="text-direct underline underline-offset-4" target="_blank" rel="noreferrer">
            supabase.com
          </a>
          .
        </li>
        <li>
          In its <strong className="text-fg">SQL Editor</strong>, run the file <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">site/supabase/schema.sql</code>.
        </li>
        <li>
          Copy <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">site/.env.example</code> to <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">site/.env.local</code> and paste in the Project URL and anon key from Project Settings → API.
        </li>
        <li>Restart <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">npm run dev</code>.</li>
      </ol>
      <p className="mt-5 text-sm text-fg-3">Full steps are in SETUP.md in the site folder.</p>
    </div>
  );
}
