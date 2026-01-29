"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  CrosshairMode,
  type BusinessDay,
} from "lightweight-charts";

export type TVPoint = { time: string; value: number }; // "YYYY-MM-DD"

type RangeKey = "1D" | "10D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "MAX";
type ViewMode = "MY" | "MARKET" | "COMPARE";

type Props = {
  title: string;
  myveg: TVPoint[];
  market?: TVPoint[];
  height?: number;
  range: RangeKey; // ✅ IMPORTANT
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toPct(data: TVPoint[]) {
  if (!data.length) return data;
  const base = data[0].value || 1;
  return data.map((p) => ({ time: p.time, value: ((p.value - base) / base) * 100 }));
}

function parseBusinessDay(yyyy_mm_dd: string): BusinessDay {
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  return { year: y, month: m, day: d };
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function rangeToDays(r: RangeKey) {
  switch (r) {
    case "1D": return 1;
    case "10D": return 10;
    case "1W": return 7;
    case "1M": return 30;
    case "3M": return 90;
    case "6M": return 180;
    case "1Y": return 365;
    case "MAX": return 0;
    default: return 30;
  }
}

export default function ProductTrendTVChart({
  title,
  myveg,
  market,
  height = 430,
  range,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const myRef = useRef<ISeriesApi<"Line"> | null>(null);
  const marketRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Hover labels
  const topLabelRef = useRef<HTMLDivElement | null>(null);
  const bottomTimeRef = useRef<HTMLDivElement | null>(null);

  const [view, setView] = useState<ViewMode>("COMPARE");
  const [mode, setMode] = useState<"ABS" | "PCT">("ABS");

  const mySeries = useMemo(
    () => (mode === "PCT" ? toPct(myveg ?? []) : myveg ?? []),
    [mode, myveg]
  );
  const mkSeries = useMemo(
    () => (mode === "PCT" ? toPct(market ?? []) : market ?? []),
    [mode, market]
  );

  // Create chart once
  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;
    if (chartRef.current) return;

    const el = containerRef.current;

    const chart = createChart(el, {
      width: el.clientWidth || 900,
      height,

      layout: { background: { color: "transparent" }, textColor: "rgba(17,23,19,0.60)" },
      grid: {
        vertLines: { color: "rgba(0,0,0,0.06)" },
        horzLines: { color: "rgba(0,0,0,0.06)" },
      },
      rightPriceScale: { borderColor: "rgba(0,0,0,0.10)", ticksVisible: true },
      timeScale: { borderColor: "rgba(0,0,0,0.10)", timeVisible: true, secondsVisible: false },

      // ✅ Only vertical dashed crosshair (Google Finance feel)
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { visible: true, labelVisible: false, width: 1, style: 2, color: "rgba(0,0,0,0.35)" },
        horzLine: { visible: false, labelVisible: false },
      },

      // ✅ ENABLE horizontal pan (drag + wheel)
      handleScroll: {
        pressedMouseMove: true,  // drag to pan
        mouseWheel: true,        // trackpad / wheel pan
        horzTouchDrag: true,     // mobile swipe pan
        vertTouchDrag: false,
      },

      // ✅ keep zoom off (Google-like simple)
      handleScale: {
        axisPressedMouseMove: false,
        mouseWheel: false,
        pinch: false,
      },
    });

    chartRef.current = chart;

    // MyVeg series (green)
    myRef.current = chart.addSeries(LineSeries, {
      lineWidth: 2,
      color: "rgba(29,185,84,0.95)",
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    // Resize
    const onResize = () => {
      if (!chartRef.current || !containerRef.current) return;
      try {
        // @ts-ignore
        chartRef.current.resize(containerRef.current.clientWidth || 900, height);
      } catch {}
    };
    window.addEventListener("resize", onResize);

    // Hover labels (top + bottom date pill)
    chart.subscribeCrosshairMove((param) => {
      const top = topLabelRef.current;
      const bottom = bottomTimeRef.current;
      const wrap = wrapperRef.current;
      if (!top || !bottom || !wrap) return;

      if (!param?.time || !param.point) {
        top.style.opacity = "0";
        bottom.style.opacity = "0";
        return;
      }

      const myS = myRef.current;
      const mkS = marketRef.current;

      const myVal = myS ? (param.seriesData.get(myS) as any)?.value : undefined;
      const mkVal = mkS ? (param.seriesData.get(mkS) as any)?.value : undefined;

      const parts: string[] = [];
      if (view !== "MARKET") parts.push(`MyVeg: ${myVal ?? "-"}`);
      if (view !== "MY" && mkS) parts.push(`Market: ${mkVal ?? "-"}`);
      top.textContent = parts.join("  |  ");
      top.style.opacity = "1";

      const wrapRect = wrap.getBoundingClientRect();
      const pillWidth = 140;
      const left = clamp(param.point.x - pillWidth / 2, 8, wrapRect.width - pillWidth - 8);

      bottom.textContent = String(param.time);
      bottom.style.transform = `translateX(${left}px)`;
      bottom.style.opacity = "1";
    });

    return () => {
      window.removeEventListener("resize", onResize);
      try { chart.remove(); } catch {}
      chartRef.current = null;
      myRef.current = null;
      marketRef.current = null;
    };
  }, [height, view]);

  // Set/Update data (IMPORTANT: no fitContent here, or it will reset your scroll!)
  useEffect(() => {
    const chart = chartRef.current;
    const myS = myRef.current;
    if (!chart || !myS) return;

    myS.setData(mySeries as any);
    try { myS.applyOptions({ visible: view !== "MARKET" }); } catch {}

    const needMarket = view !== "MY" && mkSeries?.length;

    if (needMarket) {
      if (!marketRef.current) {
        marketRef.current = chart.addSeries(LineSeries, {
          lineWidth: 2,
          color: "rgba(37,99,235,0.95)",
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
        });
      }
      marketRef.current.setData(mkSeries as any);
    } else {
      if (marketRef.current) {
        try { chart.removeSeries(marketRef.current); } catch {}
        marketRef.current = null;
      }
    }
  }, [mySeries, mkSeries, view]);

  // ✅ On range change: set initial visible window, but then user can pan freely
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !mySeries.length) return;

    if (range === "MAX") {
      try { chart.timeScale().fitContent(); } catch {}
      return;
    }

    const days = rangeToDays(range);
    const last = mySeries[mySeries.length - 1].time;
    const first = addDays(last, -(days - 1));

    try {
      chart.timeScale().setVisibleRange({
        from: parseBusinessDay(first),
        to: parseBusinessDay(last),
      });
    } catch {
      // fallback
      try { chart.timeScale().fitContent(); } catch {}
    }
  }, [range, mySeries]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Controls */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-3">
        <div>
          <div className="text-[#111713] font-black">{title}</div>
          <div className="text-sm text-[#648770] font-medium">
            Drag / scroll left-right to see previous/next dates
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { k: "MY", label: "MyVeg" },
            { k: "MARKET", label: "Market" },
            { k: "COMPARE", label: "Compare" },
          ].map((b) => (
            <button
              key={b.k}
              onClick={() => setView(b.k as ViewMode)}
              className={[
                "px-3 py-2 rounded-full text-sm font-black border transition",
                view === b.k
                  ? "bg-[#111713] text-white border-[#111713]"
                  : "bg-white text-[#111713] border-[#e0e8e3] hover:bg-[#f6f8f7]",
              ].join(" ")}
            >
              {b.label}
            </button>
          ))}

          <button
            onClick={() => setMode((m) => (m === "ABS" ? "PCT" : "ABS"))}
            className="px-3 py-2 rounded-full text-sm font-black border border-[#e0e8e3] bg-white hover:bg-[#f6f8f7]"
          >
            {mode === "ABS" ? "Price" : "% Change"}
          </button>
        </div>
      </div>

      {/* Chart wrapper + labels */}
      <div ref={wrapperRef} className="relative w-full select-none">
        <div
          ref={topLabelRef}
          className="absolute left-3 top-3 z-10 rounded-lg bg-white/95 border border-black/10 px-3 py-2 text-[#111713] shadow-md text-sm font-black"
          style={{ opacity: 0, pointerEvents: "none" }}
        />
        <div
          ref={bottomTimeRef}
          className="absolute bottom-2 z-10 rounded-md bg-[#111713] text-white px-3 py-1 text-xs font-black shadow-md"
          style={{ opacity: 0, pointerEvents: "none", width: 140 }}
        />

        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
}
