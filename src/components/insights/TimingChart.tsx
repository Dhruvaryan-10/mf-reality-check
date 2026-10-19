"use client";
import { useMemo } from "react";
import { C, EChart, baseOption } from "@/components/charts/EChart";

export function TimingChart({ bins, highlight }: { bins: { label: string; value: number }[]; highlight: number }) {
  const option = useMemo(() => {
    const base = baseOption({
      x: "category",
      tooltip: (items: { dataIndex: number }[]) => {
        const i = items[0].dataIndex;
        const to = bins[i + 1]?.label ?? "";
        return `<b>${bins[i].label}${to ? ` to ${to}` : "+"} a year</b><br/>${bins[i].value} five-year periods`;
      },
    }) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      ...base,
      tooltip: { ...base.tooltip, axisPointer: { type: "shadow", shadowStyle: { color: "rgba(148,163,184,0.08)" } } },
      xAxis: { ...base.xAxis, data: bins.map((b) => b.label), axisLabel: { ...base.xAxis.axisLabel, interval: 1 } },
      yAxis: { ...base.yAxis, minInterval: 1 },
      series: [
        {
          type: "bar",
          barCategoryGap: "12%",
          data: bins.map((b, i) => ({
            value: b.value,
            itemStyle: { color: i === highlight ? C.regular : C.direct, borderRadius: [5, 5, 0, 0] },
          })),
        },
      ],
    };
  }, [bins, highlight]);
  return <EChart option={option} height={340} label="How many five-year periods earned each yearly return" />;
}
