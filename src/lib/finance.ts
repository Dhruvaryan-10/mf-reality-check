import type { WeeklyPoint } from "./types";

/** Yearly return of dated cash flows (outflows negative), e.g. a SIP. */
export function xirr(flows: { date: Date; amount: number }[]) {
  const t0 = flows[0].date.getTime();
  const years = flows.map((f) => (f.date.getTime() - t0) / (365 * 864e5));
  const npv = (r: number) => flows.reduce((s, f, i) => s + f.amount / (1 + r) ** years[i], 0);
  let lo = -0.99;
  let hi = 10;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export interface SipResult {
  path: { date: string; invested: number; value: number }[];
  invested: number;
  value: number;
  months: number;
  xirr: number | null;
}

/** Monthly SIP on weekly NAVs: buy at the first data point of each month from `startIso`. */
export function runSip(weekly: WeeklyPoint[], monthly: number, startIso: string): SipResult | null {
  let units = 0;
  let invested = 0;
  let lastMonth = "";
  const flows: { date: Date; amount: number }[] = [];
  const path: SipResult["path"] = [];
  for (const p of weekly) {
    if (p.date < startIso || p.nav == null) continue;
    const month = p.date.slice(0, 7);
    if (month !== lastMonth) {
      units += monthly / p.nav;
      invested += monthly;
      flows.push({ date: new Date(p.date), amount: -monthly });
      lastMonth = month;
    }
    path.push({ date: p.date, invested, value: units * p.nav });
  }
  if (!path.length) return null;
  const last = path[path.length - 1];
  flows.push({ date: new Date(last.date), amount: last.value });
  return {
    path,
    invested: last.invested,
    value: last.value,
    months: flows.length - 1,
    xirr: flows.length > 2 ? xirr(flows) : null,
  };
}

/** NAV on or just after a date (weekly data). */
export function navOn(weekly: WeeklyPoint[], iso: string) {
  return weekly.find((p) => p.date >= iso && p.nav != null) ?? null;
}

export function latestNav(weekly: WeeklyPoint[]) {
  for (let i = weekly.length - 1; i >= 0; i--) if (weekly[i].nav != null) return weekly[i];
  return null;
}

export function recoveryAfterWorstFall(weekly: WeeklyPoint[]) {
  let worstIdx = -1;
  let worst = 0;
  weekly.forEach((p, i) => {
    if (p.drawdown != null && p.drawdown < worst) {
      worst = p.drawdown;
      worstIdx = i;
    }
  });
  if (worstIdx < 0) return null;
  let rec = worstIdx;
  while (rec < weekly.length && (weekly[rec].drawdown ?? 0) < -0.0005) rec++;
  if (rec >= weekly.length) return { monthsToRecover: null as number | null };
  const months = Math.round((+new Date(weekly[rec].date) - +new Date(weekly[worstIdx].date)) / (30.44 * 864e5));
  return { monthsToRecover: months };
}
