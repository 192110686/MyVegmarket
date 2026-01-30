"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductTrendTVChart, { type TVPoint } from "./ProductTrendTVChart";

type RangeKey = "1D" | "10D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "MAX";

type TrendPoint = {
  time: string;
  marketAvg: number;
  myPrice: number;
};

export default function PriceTrendModal({
  open,
  onClose,
  productId,
  productName,
}: {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName?: string;
}) {
  const [range, setRange] = useState<RangeKey>("1M");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrendPoint[]>([]);

  // ✅ avg pill text will be updated directly (NO state)
  const avgRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => {
    const base = productName ? productName + " - " : "";
    return base + "Price Trend";
  }, [productName]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    const t = setTimeout(() => {
      const history = makeDummyHistory({
        start: "2025-01-01",
        days: 900,
        seed: hashSeed(productId || "default"),
      });
      setData(history);
      setLoading(false);

      // reset avg text quickly
      if (avgRef.current) avgRef.current.textContent = "Avg: -";
    }, 120);

    return () => clearTimeout(t);
  }, [open, productId]);

  if (!open) return null;

  const myvegSeries = toTVSeries(data, "myPrice");
  const marketSeries = toTVSeries(data, "marketAvg");

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-5xl rounded-[26px] bg-white shadow-2xl border border-[#e0e8e3] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef3ef]">
          <div>
            <h2 className="text-lg font-black text-[#111713]">{title}</h2>
            <p className="text-sm text-[#648770] font-medium">
              MyVegMarket vs Market price trend
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="h-10 w-10 rounded-full hover:bg-[#f0f4f2] grid place-items-center text-[#111713] font-black"
            title="Close"
          >
            X
          </button>
        </div>

        {/* ✅ Time ranges row + AVG at top-right beside MAX */}
        <div className="px-6 pt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["1D", "10D", "1W", "1M", "3M", "6M", "1Y", "MAX"] as RangeKey[]).map(
              (k) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-black border transition",
                    range === k
                      ? "bg-[#1db954] text-white border-[#1db954]"
                      : "bg-white text-[#111713] border-[#e0e8e3] hover:bg-[#f6f8f7]",
                  ].join(" ")}
                >
                  {k}
                </button>
              )
            )}
          </div>

          {/* ✅ Avg pill */}
          <div
            ref={avgRef}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-black border border-[#e0e8e3] bg-white text-[#111713]"
          >
            Avg: -
          </div>
        </div>

        <div className="px-6 pt-4 pb-6">
          <div className="rounded-2xl bg-[#f6f8f7] border border-[#e0e8e3] p-3 overflow-hidden">
            {loading ? (
              <div className="h-[430px] grid place-items-center text-[#648770] font-medium">
                Loading chart...
              </div>
            ) : data.length === 0 ? (
              <div className="h-[430px] grid place-items-center text-[#648770] font-medium">
                No trend data available.
              </div>
            ) : (
              <ProductTrendTVChart
                title={title}
                range={range}
                myveg={myvegSeries}
                market={marketSeries}
                height={430}
                onAvgTextChange={(text) => {
                  if (!avgRef.current) return;
                  // ✅ NO state update here (no rerender)
                  avgRef.current.textContent = text || "Avg: -";
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toTVSeries(data: TrendPoint[], key: "marketAvg" | "myPrice"): TVPoint[] {
  return data.map((d) => ({ time: d.time, value: d[key] }));
}

/** ---------------- DUMMY HISTORY GENERATOR ---------------- **/

function makeDummyHistory(opts: { start: string; days: number; seed: number }): TrendPoint[] {
  const { start, days } = opts;

  let s = opts.seed || 1234567;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };

  let t = start;

  let my = 6.8 + rnd() * 0.6;
  let mk = 9.5 + rnd() * 0.8;

  const out: TrendPoint[] = [];
  for (let i = 0; i < days; i++) {
    const season = Math.sin(i / 18) * 0.18 + Math.sin(i / 70) * 0.1;
    my += (rnd() - 0.5) * 0.08 + season * 0.22;
    mk += (rnd() - 0.5) * 0.1 + season * 0.3;

    my = Math.max(4.5, Math.min(12.0, my));
    mk = Math.max(6.0, Math.min(18.0, mk));

    out.push({
      time: t,
      myPrice: +my.toFixed(2),
      marketAvg: +mk.toFixed(2),
    });

    t = addDaysLocal(t, 1);
  }

  return out;
}

function addDaysLocal(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function hashSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
