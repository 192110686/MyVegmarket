"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type RangeKey = "week" | "month" | "year";

type TrendPoint = {
  label: string;
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
  const [range, setRange] = useState<RangeKey>("week");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrendPoint[]>([]);

  const title = useMemo(() => {
    const base = productName ? productName + " - " : "";
    return (
      base +
      (range === "week"
        ? "Weekly Trend"
        : range === "month"
        ? "Monthly Trend"
        : "Yearly Trend")
    );
  }, [range, productName]);

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
    setTimeout(() => {
      setData(getMockData(range));
      setLoading(false);
    }, 200);
  }, [open, range, productId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-5xl rounded-[26px] bg-white shadow-2xl border border-[#e0e8e3] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef3ef]">
          <div>
            <h2 className="text-lg font-black text-[#111713]">{title}</h2>
            <p className="text-sm text-[#648770] font-medium">
              Market Average vs MyVegMarket Price
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

        <div className="px-6 pt-4 flex gap-2">
          {[
            { key: "week", label: "Weekly" },
            { key: "month", label: "Monthly" },
            { key: "year", label: "Yearly" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setRange(t.key as RangeKey)}
              className={[
                "px-4 py-2 rounded-full text-sm font-black border transition",
                range === t.key
                  ? "bg-[#1db954] text-white border-[#1db954]"
                  : "bg-white text-[#111713] border-[#e0e8e3] hover:bg-[#f6f8f7]",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-6 pt-4 pb-6">
          <div className="h-[430px] rounded-2xl bg-[#f6f8f7] border border-[#e0e8e3]">
            {loading ? (
              <div className="h-full grid place-items-center text-[#648770] font-medium">
                Loading chart...
              </div>
            ) : data.length === 0 ? (
              <div className="h-full grid place-items-center text-[#648770] font-medium">
                No trend data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 18, right: 20, left: 0, bottom: 18 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="marketAvg" />
                  <Bar dataKey="myPrice" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getMockData(range: RangeKey): TrendPoint[] {
  if (range === "week") {
    return [
      { label: "Mon", marketAvg: 9.2, myPrice: 6.7 },
      { label: "Tue", marketAvg: 9.0, myPrice: 6.8 },
      { label: "Wed", marketAvg: 9.4, myPrice: 6.75 },
      { label: "Thu", marketAvg: 9.1, myPrice: 6.7 },
      { label: "Fri", marketAvg: 9.6, myPrice: 6.9 },
      { label: "Sat", marketAvg: 9.8, myPrice: 7.0 },
      { label: "Sun", marketAvg: 9.3, myPrice: 6.85 },
    ];
  }
  if (range === "month") {
    return [
      { label: "W1", marketAvg: 9.1, myPrice: 6.6 },
      { label: "W2", marketAvg: 9.5, myPrice: 6.8 },
      { label: "W3", marketAvg: 9.7, myPrice: 6.95 },
      { label: "W4", marketAvg: 9.2, myPrice: 6.7 },
    ];
  }
  return [
    { label: "Jan", marketAvg: 10.2, myPrice: 7.4 },
    { label: "Feb", marketAvg: 10.0, myPrice: 7.2 },
    { label: "Mar", marketAvg: 9.6, myPrice: 7.0 },
    { label: "Apr", marketAvg: 9.2, myPrice: 6.8 },
    { label: "May", marketAvg: 9.0, myPrice: 6.7 },
    { label: "Jun", marketAvg: 9.4, myPrice: 6.9 },
  ];
}
