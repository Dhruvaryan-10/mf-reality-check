import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/hanken-grotesk";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { getFunds, getLastDate } from "@/lib/data";

export const metadata: Metadata = {
  title: { default: "Fund Reality: Indian mutual funds, explained with real data", template: "%s · Fund Reality" },
  description:
    "What the Regular plan really costs, what a typical investor got, and how far funds can fall. 13 years of real NAV data, explained for beginners.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#080b14" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-ink-900">
          Skip to content
        </a>
        <SmoothScroll>
          <Navbar />
          <main id="main">{children}</main>
          <Footer lastDate={getLastDate()} funds={getFunds().length} />
        </SmoothScroll>
      </body>
    </html>
  );
}
