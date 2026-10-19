import type { Category } from "./types";

const MINUS = "−";

export function rupees(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "–";
  return `${n < 0 ? MINUS : ""}₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;
}

/** ₹21.2 lakh, ₹1.84 crore, ₹45,000 */
export function rupeesShort(n: number | null | undefined, digits?: number) {
  if (n == null || Number.isNaN(n)) return "–";
  const sign = n < 0 ? MINUS : "";
  const a = Math.abs(n);
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(digits ?? 2)} crore`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(digits ?? 1)} lakh`;
  return `${sign}₹${Math.round(a).toLocaleString("en-IN")}`;
}

export function rupeesAxis(n: number) {
  const a = Math.abs(n);
  if (a >= 1e7) return `₹${+(n / 1e7).toFixed(2)}Cr`;
  if (a >= 1e5) return `₹${+(n / 1e5).toFixed(1)}L`;
  if (a >= 1e3) return `₹${+(n / 1e3).toFixed(0)}k`;
  return `₹${n}`;
}

export function pct(x: number | null | undefined, digits = 1) {
  if (x == null || Number.isNaN(x)) return "–";
  const s = (Math.abs(x) * 100).toFixed(digits);
  return x < 0 && Number(s) !== 0 ? `${MINUS}${s}%` : `${s}%`;
}

const MONTH_YEAR = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" });
const FULL_DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const monthYear = (iso: string) => MONTH_YEAR.format(new Date(iso + "T00:00:00"));
export const fullDate = (iso: string) => FULL_DATE.format(new Date(iso + "T00:00:00"));

export const CATEGORY_LABEL: Record<Category, string> = {
  index: "Index fund",
  large_cap: "Large cap",
  flexi_cap: "Flexi cap",
  mid_cap: "Mid cap",
  small_cap: "Small cap",
};

export const CATEGORY_BLURB: Record<Category, string> = {
  index: "Copies the Nifty 50. No manager, tiny fees.",
  large_cap: "India's ~100 biggest companies.",
  flexi_cap: "The manager can buy companies of any size.",
  mid_cap: "Medium-sized companies.",
  small_cap: "Small companies: fastest growth, hardest falls.",
};

export const CATEGORY_ORDER: Category[] = ["index", "large_cap", "flexi_cap", "mid_cap", "small_cap"];

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
