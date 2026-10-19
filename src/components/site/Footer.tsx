import Link from "next/link";
import { SITE } from "@/lib/site";
import { fullDate } from "@/lib/format";
import { Logo } from "./Navbar";

export function Footer({ lastDate, funds }: { lastDate: string; funds: number }) {
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="mx-auto grid max-w-page gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-md">
          <div className="flex items-center gap-2.5 font-display text-lg font-semibold">
            <Logo /> Fund Reality
          </div>
          <p className="mt-4 text-fg-2">
            Indian mutual funds explained with real data: {funds} funds, both plans, daily NAVs up to {fullDate(lastDate)}. A
            learning project, not investment advice. Past returns don't predict future returns.
          </p>
          {(SITE.author || SITE.github) && (
            <p className="mt-4 text-sm text-fg-3">
              {SITE.author && <>Built by {SITE.author}. </>}
              {SITE.github && (
                <a href={SITE.github} className="underline underline-offset-4 hover:text-fg" target="_blank" rel="noreferrer">
                  Code and data on GitHub
                </a>
              )}
            </p>
          )}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-fg">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-fg-2">
            {[
              ["/learn", "Learn the basics"],
              ["/funds", "All funds"],
              ["/sip", "SIP simulator"],
              ["/insights", "Insights"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-fg">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-fg">For members</h2>
          <ul className="mt-4 space-y-2.5 text-fg-2">
            {[
              ["/dashboard", "Your portfolio cost check"],
              ["/dashboard?tab=watchlist", "Watchlist"],
              ["/dashboard?tab=sips", "Saved SIPs"],
              ["/compare", "Compare funds"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} prefetch={false} className="hover:text-fg">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-page px-5 py-6 text-sm text-fg-3 sm:px-8">
          Data:{" "}
          <a href="https://www.mfapi.in" className="underline underline-offset-4 hover:text-fg" target="_blank" rel="noreferrer">
            mfapi.in
          </a>{" "}
          (AMFI NAVs). Analysis in Python, pandas and DuckDB.
        </p>
      </div>
    </footer>
  );
}
