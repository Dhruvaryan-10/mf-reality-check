"use client";
// Thin wrapper around ECharts, styled for the dark theme.
import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, MarkLineComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

export const C = {
  fg: "#e8ecf4",
  fg2: "#a7b0c4",
  fg3: "#717c95",
  line: "rgba(148,163,184,0.12)",
  surface: "#10172a",
  direct: "#4c8dff",
  regular: "#e25d2c",
  index: "#8c96ab",
  band: "rgba(226,93,44,0.22)",
  extra: ["#4c8dff", "#e25d2c", "#3ddc97"], // compare page: up to three funds
};

const FONT = '"Hanken Grotesk Variable", system-ui, sans-serif';

export function baseOption({
  y,
  x = "time",
  tooltip,
}: {
  y?: (v: number) => string;
  x?: "time" | "category";
  tooltip?: (items: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any
}): EChartsCoreOption {
  const label = { color: C.fg3, fontFamily: FONT, fontSize: 12 };
  return {
    animationDuration: 900,
    animationEasing: "cubicOut",
    textStyle: { fontFamily: FONT },
    grid: { left: 4, right: 12, top: 16, bottom: 4, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(16,23,42,0.92)",
      borderColor: "rgba(148,163,184,0.25)",
      borderWidth: 1,
      padding: [10, 14],
      extraCssText: "backdrop-filter: blur(8px); border-radius: 12px; box-shadow: 0 12px 40px -12px rgba(0,0,0,.7);",
      textStyle: { color: C.fg, fontFamily: FONT, fontSize: 13 },
      axisPointer: { type: "line", lineStyle: { color: "rgba(232,236,244,0.35)", width: 1, type: "dashed" } },
      formatter: tooltip,
    },
    xAxis: {
      type: x,
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { ...label, hideOverlap: true },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...label, formatter: y },
      splitLine: { lineStyle: { color: C.line } },
    },
  };
}

/** A line series with our standard styling. */
export function line(name: string, data: [string, number][], color: string, opts: Record<string, unknown> = {}) {
  return {
    name,
    type: "line",
    data,
    symbol: "none",
    smooth: 0.15,
    lineStyle: { width: 2, color },
    itemStyle: { color },
    emphasis: { disabled: true },
    ...opts,
  };
}

export function EChart({ option, height = 340, label }: { option: EChartsCoreOption | null; height?: number; label: string }) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!el.current) return;
    chart.current = echarts.init(el.current, null, { renderer: "canvas" });
    const ro = new ResizeObserver(() => chart.current?.resize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    if (chart.current && option) chart.current.setOption(option, true);
  }, [option]);

  return (
    <div className="relative" style={{ height }}>
      {!option && <div className="absolute inset-0 animate-pulse rounded-xl bg-white/[0.03]" aria-hidden="true" />}
      <div ref={el} className="h-full w-full" role="img" aria-label={label} />
    </div>
  );
}

/** Colour key above a chart. */
export function Key({ items }: { items: { label: string; color: string; dashed?: boolean; area?: boolean }[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          {it.area ? (
            <span className="h-3 w-4 rounded-[3px]" style={{ background: it.color }} aria-hidden="true" />
          ) : (
            <span className="w-5 border-t-2" style={{ borderColor: it.color, borderTopStyle: it.dashed ? "dashed" : "solid" }} aria-hidden="true" />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}
