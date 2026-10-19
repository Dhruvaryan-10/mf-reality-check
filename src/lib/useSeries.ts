"use client";
// Client-side loading of a fund's weekly series (public/data/funds/<code>.json), cached.
import { useEffect, useState } from "react";
import type { FundSeries } from "./types";

const cache = new Map<string, Promise<FundSeries>>();

export function loadSeries(code: string) {
  if (!cache.has(code)) {
    cache.set(
      code,
      fetch(`/data/funds/${code}.json`).then((r) => {
        if (!r.ok) throw new Error(`Could not load fund ${code}`);
        return r.json();
      })
    );
  }
  return cache.get(code)!;
}

/** Loads several series at once; returns null until all are ready. */
export function useSeries(codes: (string | null | undefined)[]) {
  const key = codes.join("|");
  const [data, setData] = useState<FundSeries[] | null>(null);
  useEffect(() => {
    let alive = true;
    const valid = codes.filter((c): c is string => !!c);
    if (valid.length !== codes.length) return;
    Promise.all(valid.map(loadSeries))
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // Only hand back data that matches the codes asked for (avoids showing the previous fund)
  return data && data.length === codes.length && data.every((d, i) => d.scheme_code === codes[i]) ? data : null;
}
