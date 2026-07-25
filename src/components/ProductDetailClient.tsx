"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DbProduct } from "@/lib/productsDb";
import type { TVPoint } from "@/components/ProductTrendTVChart";
import { getSupabase } from "@/lib/supabaseClient";

type RangeKey = React.ComponentProps<typeof ProductTrendTVChart>["range"];

// ✅ Lazy-load chart so product page loads faster (no "Loading..." text shown)
const ProductTrendTVChart = dynamic(() => import("@/components/ProductTrendTVChart"), {
  ssr: false,
  loading: () => null,
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// ✅ Support contacts
const SUPPORT_CALL_NUMBER = "7010220771";
// WhatsApp needs country code. Assuming India (+91). Change if needed.
const SUPPORT_WHATSAPP_NUMBER_E164 = "917010220771";

function storagePublicUrl(path?: string | null) {
  if (!path) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/product_images/${path}`;
}

function safeImg(url?: string | null) {
  return (
    url ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
  );
}

type TrendPoint = {
  time: string;
  marketAvg: number;
  myPrice: number; // kept for chart compatibility (we won't show MyVegMarket in UI)
};

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

/** Shipment label + Material icon */
function shipmentLabel(mode?: string | null) {
  const m = (mode ?? "").toLowerCase().trim();
  if (m === "air") return { icon: "flight", text: "Air" };
  if (m === "sea") return { icon: "directions_boat", text: "Sea" };
  if (m === "road") return { icon: "local_shipping", text: "Road" };
  if (m === "mixed") return { icon: "swap_horiz", text: "Mixed" };
  return null;
}

function formatUpdatedAtDubai(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;

  // Format in Dubai time
  return dt.toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Optional: normalize packaging display */
function formatPackaging(raw?: string | null) {
  const p = (raw ?? "").trim();
  if (!p) return "";
  // If already starts with "Packaging:", keep it as-is
  if (/^packaging:/i.test(p)) return p;

  // Try to convert "3.1kg Mesh bag" -> "Packaging: Mesh bag (3.1 kg)"
  const m = p.match(/^\s*([\d.]+)\s*kg\s+(.+)\s*$/i);
  if (m) {
    const qty = m[1];
    const name = m[2].trim();
    return `Packaging: ${name} (${qty} kg)`;
  }

  return `Packaging: ${p}`;
}


type MarketHistoryPoint = {
  time: string;
  value: number;
};

type MarketOverview = {
  current: number;
  previous: number | null;
  highest: number;
  lowest: number;
  average: number;
  median: number;
  updates: number;
  from: string | null;
  to: string | null;
  changePercent: number | null;
};

function medianValue(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function formatPrice(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `AED ${value.toFixed(2)}`;
}

function formatShortDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildSparklinePath(points: MarketHistoryPoint[], width = 520, height = 180) {
  if (!points.length) return "";

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);
  const xStep = points.length > 1 ? width / (points.length - 1) : 0;

  return points
    .map((point, index) => {
      const x = index * xStep;
      const y = height - ((point.value - min) / spread) * (height - 24) - 12;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function ProductDetailClient({
  product,
  isAlAweerLite = false,
}: {
  product: DbProduct;
  isAlAweerLite?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ✅ full-page trend controlled by URL param
  const trendOpen = searchParams.get("trend") === "1";

  // chart state
  const [range, setRange] = useState<RangeKey>("1M");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrendPoint[]>([]);
  const [avgText, setAvgText] = useState("Avg: -");

  // ✅ DB-driven last updated for Al Aweer rate (from price_updates.created_at)
  const [marketUpdatedAt, setMarketUpdatedAt] = useState<string | null>(null);
  const [marketAvgFromDb, setMarketAvgFromDb] = useState<number | null>(null);
  const [previewHistory, setPreviewHistory] = useState<MarketHistoryPoint[]>([]);

  // ✅ avoid window access during render (prevents hydration quirks)
  const [chartHeight, setChartHeight] = useState(560);
  useEffect(() => {
    const calc = () => setChartHeight(window.innerWidth < 640 ? 420 : 560);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const title = product.name;
  const origin = product.origin_country ?? "UAE";
  const grade = "Regular"; // DB doesn't have grade yet (we can add later)
  const unit = product.unit ?? "kg";

  // ✅ Market-only for Price Analysis (DB override if found)
  const marketAvg = marketAvgFromDb ?? (product.market_price_aed ?? 0);

  const slugOrId = product.slug || product.id;

  // ✅ Pull shipment from DB (products.shipment_mode)
  const ship = shipmentLabel((product as any).shipment_mode);

  // ✅ Prefetch chart chunk BEFORE opening overlay (feels instant, no "loading" text)
  const openTrendPageFast = async () => {
    try {
      await import("@/components/ProductTrendTVChart");
    } catch {
      // ignore – overlay will still open, chart will load when ready
    }
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("trend", "1");
    router.push(`${pathname}?${qs.toString()}`, { scroll: false });
  };

  const closeTrendPage = () => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.delete("trend");
    const next = qs.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  // ✅ Load the LATEST DB price update for this product using:
  // - price_updates.product_key (text)
  // - price_updates.created_at (timestamptz)
  // - price_updates.price (numeric)
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;

    const run = async () => {
      try {
        // ✅ product_key is your identifier (most likely equals product.slug)
        const productKey = product.slug || product.id;

        const { data: row, error } = await supabase
          .from("price_updates")
          .select("created_at, price")
          .eq("product_key", productKey)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("price_updates fetch error:", error);
          setMarketUpdatedAt(null);
          return;
        }
        if (!row) {
          console.warn("No price_updates row found for product_key:", productKey);
          setMarketUpdatedAt(null);
          return;
        }

        // ✅ last updated time
        setMarketUpdatedAt((row as any).created_at ?? null);

        // ✅ override market price from DB
        const p = (row as any).price;
        const num = typeof p === "number" ? p : Number(p);
        if (Number.isFinite(num)) setMarketAvgFromDb(num);
      } catch (e) {
        console.error("price_updates exception:", e);
        if (!cancelled) setMarketUpdatedAt(null);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [product.slug, product.id]);

 // ✅ Load REAL history from DB when opening trend page
useEffect(() => {
  if (!trendOpen) return;

  const supabase = getSupabase();
  if (!supabase) return;

  let cancelled = false;

  function rangeToStartISO(r: RangeKey) {
    const now = new Date();
    const d = new Date(now);
    d.setSeconds(0, 0);

    if (r === "1D") d.setDate(d.getDate() - 1);
    else if (r === "1W") d.setDate(d.getDate() - 7);
    else if (r === "1M") d.setMonth(d.getMonth() - 1);
    else if (r === "3M") d.setMonth(d.getMonth() - 3);
    else if (r === "6M") d.setMonth(d.getMonth() - 6);
    else if (r === "1Y") d.setFullYear(d.getFullYear() - 1);
    else return null; // MAX

    return d.toISOString();
  }

  const run = async () => {
    try {
      setLoading(true);

      const productKey = product.slug || product.id;
      const startISO = rangeToStartISO(range);

      let q = supabase
        .from("price_history")
        .select("price, published_at, source")
        .eq("product_key", productKey)
        .order("published_at", { ascending: true });

      if (startISO) q = q.gte("published_at", startISO);

      const { data: rows, error } = await q;

      if (cancelled) return;

      if (error) {
        console.error("price_history fetch error:", error);
        setData([]);
        setLoading(false);
        setAvgText("Avg: -");
        return;
      }

      const out: TrendPoint[] = (rows ?? [])
        .map((r: any) => {
          const ts = r.published_at || null;
          const p = typeof r.price === "number" ? r.price : Number(r.price);
          if (!ts || !Number.isFinite(p)) return null;

          const iso = new Date(ts).toISOString();
          const source = String(r.source || "").toLowerCase();
          const isMarket = source === "al_aweer";

          return {
            time: iso,
            marketAvg: isMarket ? p : NaN,
            myPrice: !isMarket ? p : NaN,
          };
        })
        .filter(Boolean) as TrendPoint[];

      // Fill forward market price so the line stays continuous
      let lastMarket: number | null = null;
      const filled: TrendPoint[] = out.map((pt) => {
        const mv = Number.isFinite(pt.marketAvg) ? pt.marketAvg : null;
        if (mv != null) lastMarket = mv;

        return {
          ...pt,
          marketAvg: mv != null ? mv : lastMarket ?? 0,
          myPrice: Number.isFinite(pt.myPrice) ? pt.myPrice : 0,
        };
      });

      setData(filled);
      setLoading(false);
      setAvgText("Avg: -");
    } catch (e) {
      console.error("price_history exception:", e);
      if (!cancelled) {
        setData([]);
        setLoading(false);
        setAvgText("Avg: -");
      }
    }
  };

  run();

  return () => {
    cancelled = true;
  };
}, [trendOpen, slugOrId, range]);

  // ESC closes full page
  useEffect(() => {
    if (!trendOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTrendPage();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendOpen]);

  // lock scroll when full page open
  useEffect(() => {
    if (!trendOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [trendOpen]);

  // ✅ Market series only (UI is market-only; chart can still accept myveg empty)
  const marketSeries = useMemo(() => toTVSeries(data, "marketAvg"), [data]);

  const onWhatsAppSupport = () => {
    const msg = encodeURIComponent(`Hi, I need support for ${title} (MyVegMarket).`);
    const url = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER_E164}?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onCallSupport = () => {
    window.location.href = `tel:+91${SUPPORT_CALL_NUMBER}`;
  };


  const productImage = safeImg(
    storagePublicUrl((product as any)?.image_url || ""),
  );

  const packagingText =
    formatPackaging((product as any).packaging).replace(/^Packaging:\s*/i, "") ||
    "Standard market packaging";

  const marketOverview = useMemo<MarketOverview>(() => {
    const values = previewHistory.map((point) => point.value);
    const current = marketAvg;

    if (!values.length) {
      return {
        current,
        previous: null,
        highest: current,
        lowest: current,
        average: current,
        median: current,
        updates: 0,
        from: null,
        to: marketUpdatedAt,
        changePercent: null,
      };
    }

    const previous =
      values.length > 1 ? values[values.length - 2] : values[0];
    const latest = values[values.length - 1];
    const changePercent =
      previous > 0 ? ((latest - previous) / previous) * 100 : null;

    return {
      current,
      previous,
      highest: Math.max(...values),
      lowest: Math.min(...values),
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
      median: medianValue(values),
      updates: values.length,
      from: previewHistory[0]?.time ?? null,
      to: previewHistory[previewHistory.length - 1]?.time ?? marketUpdatedAt,
      changePercent,
    };
  }, [marketAvg, marketUpdatedAt, previewHistory]);

  const sparklinePath = useMemo(
    () => buildSparklinePath(previewHistory),
    [previewHistory],
  );

  const qualityPoints = [
    "Rich source of vitamins, minerals and antioxidants",
    "Suitable for restaurants, groceries and bulk buyers",
    "Consistent grading for reliable commercial use",
    "Carefully sourced and quality checked",
  ];

  const sourceBenefits = [
    {
      icon: "verified",
      title: "Verified Al Aweer Prices",
      text: "Updated market rates from official and approved sources",
    },
    {
      icon: "groups",
      title: "Trusted by Businesses",
      text: "Designed for restaurants, groceries, resellers and exporters",
    },
    {
      icon: "inventory_2",
      title: "Bulk Sourcing Support",
      text: "Help finding reliable supply for larger business requirements",
    },
    {
      icon: "chat",
      title: "WhatsApp Assistance",
      text: "Quick support for orders, market rates and product enquiries",
    },
  ];

  return (
    <>
      {/* ✅ FULL PAGE TREND OVERLAY */}
      {trendOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#f6f8f7]">
          <div className="h-full w-full px-4 sm:px-8 lg:px-16 pt-6 pb-6 overflow-hidden">
            {/* Premium Top bar */}
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[#111713] text-2xl sm:text-3xl font-black truncate">
                  {title}
                </div>
                <div className="text-[#648770] text-sm font-medium">
                  Al Aweer market trend
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Market Avg pill */}
                <div className="px-4 py-2 rounded-full bg-white border border-[#e0e8e3] text-[#111713] font-black text-sm">
                  {avgText}
                </div>

                {/* Close */}
                <button
                  onClick={closeTrendPage}
                  className="h-11 px-5 rounded-full bg-white border border-[#e0e8e3] text-[#111713] font-black hover:shadow-sm flex items-center gap-2"
                  title="Close"
                >
                  <span className="material-symbols-outlined">close</span>
                  Close
                </button>
              </div>
            </div>

            {/* Controls Row */}
            <div className="max-w-[1400px] mx-auto mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-xs font-black uppercase tracking-wider text-[#648770]">
                  Range
                </div>

                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value as RangeKey)}
                  className="h-11 px-4 rounded-full bg-white border border-[#e0e8e3]
                       text-[#111713] font-black text-sm outline-none
                       focus:ring-2 focus:ring-[#1db954]/20"
                >
                  <option value="1D">1 Day</option>
                  <option value="1W">1 Week</option>
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="6M">6 Months</option>
                  <option value="1Y">1 Year</option>
                  <option value="MAX">Max</option>
                </select>
              </div>
            </div>

            {/* Chart Card */}
            <div className="max-w-[1400px] mx-auto mt-4 h-[calc(100vh-170px)] min-h-0">
              <div className="h-full rounded-[28px] bg-white border border-[#e0e8e3] shadow-sm p-4 sm:p-5 overflow-hidden">
                {loading || data.length === 0 ? (
                  <div className="h-full w-full rounded-2xl bg-[#f6f8f7] animate-pulse" />
                ) : (
                  <ProductTrendTVChart
                    title={`${title} - Market Price Trend`}
                    range={range}
                    myveg={[]} // ✅ keep hidden
                    market={marketSeries}
                    height={chartHeight}
                    onAvgTextChange={(text: string) => setAvgText(text || "Avg: -")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM PRODUCT DETAIL PAGE */}
<main className="bg-[#f6f8f7] px-4 pb-8 pt-8 sm:px-6 lg:px-10 xl:px-14">
          <div className="mx-auto max-w-[1460px]">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-2 text-sm font-medium text-[#648770]">
            <Link className="transition hover:text-[#0c8f3c]" href="/">
              Home
            </Link>
            <span className="material-symbols-outlined text-base">
              chevron_right
            </span>
            <Link
              className="transition hover:text-[#0c8f3c]"
              href={`/products/${product.category}`}
            >
              Products
            </Link>
            <span className="material-symbols-outlined text-base">
              chevron_right
            </span>
            <span className="font-black text-[#111713]">{title}</span>
          </nav>

          {/* Product hero */}
          <section className="overflow-hidden rounded-[30px] border border-[#dde8e1] bg-white p-4 shadow-[0_12px_40px_rgba(17,23,19,0.06)] sm:p-5 lg:p-6">
            <div className="grid gap-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              {/* Product gallery */}
<div className="relative min-h-[360px] overflow-hidden rounded-[24px] border border-[#e1e9e4] bg-gradient-to-br from-[#f8faf9] to-[#eef4f0]">                <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-[#078a36] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-[#078a36]/20">
                  <span className="material-symbols-outlined text-[16px]">
                    workspace_premium
                  </span>
                  Top Quality
                </div>

<div className="flex min-h-[360px] items-center justify-center p-8">
                    <img
                    src={productImage}
                    alt={title}
className="h-full max-h-[285px] w-full object-contain drop-shadow-[0_16px_18px_rgba(17,23,19,0.10)]"
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";
                    }}
                  />
                </div>
              </div>

              {/* Product information */}
              <div className="flex min-w-0 flex-col py-1 lg:py-3">
                <div>
                  <h1 className="text-[40px] font-black leading-[1.05] tracking-[-0.04em] text-[#111713] sm:text-[50px] xl:text-[56px]">
                    {title}
                  </h1>

                  <div className="mt-3 flex items-center gap-2 text-sm font-bold text-[#111713] sm:text-base">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e7f7ed] text-[#078a36]">
                      <span className="material-symbols-outlined text-[18px]">
                        verified_user
                      </span>
                    </span>
                    Premium Quality • Fresh • Hand Selected
                  </div>

                  <div className="mt-7 flex flex-wrap gap-x-7 gap-y-4 text-sm text-[#33443a] sm:text-base">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#315f45]">
                        location_on
                      </span>
                      <span>
                        <strong className="text-[#111713]">Origin:</strong>{" "}
                        {origin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#315f45]">
                        grade
                      </span>
                      <span>
                        <strong className="text-[#111713]">Grade:</strong>{" "}
                        {grade}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#315f45]">
                        scale
                      </span>
                      <span>
                        <strong className="text-[#111713]">Unit:</strong> {unit}
                      </span>
                    </div>
                    {ship && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#315f45]">
                          {ship.icon}
                        </span>
                        <span>
                          <strong className="text-[#111713]">Shipment:</strong>{" "}
                          {ship.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

   <div className="mt-7 rounded-[22px] border border-[#dfe8e2] bg-[#fbfdfb] p-5">
  <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_auto]">
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#648770]">
        Al Aweer market rate
      </p>

      <p className="mt-1 text-4xl font-black tracking-[-0.03em] text-[#078a36]">
        {formatPrice(marketOverview.current)}
      </p>
    </div>

    <div className="border-[#e1e9e4] sm:border-l sm:pl-6">
      <p className="text-xs font-bold text-[#648770]">
        Last updated
      </p>

      <p className="mt-1 text-sm font-black text-[#111713]">
        {marketUpdatedAt
          ? formatUpdatedAtDubai(marketUpdatedAt)
          : "—"}
      </p>
    </div>

    {marketOverview.changePercent != null ? (
      <div
        className={[
          "rounded-2xl px-5 py-4 text-center",
          marketOverview.changePercent >= 0
            ? "bg-[#edf8f1] text-[#078a36]"
            : "bg-[#fff1f1] text-[#c53030]",
        ].join(" ")}
      >
        <p className="text-lg font-black">
          {marketOverview.changePercent >= 0 ? "↑ " : "↓ "}
          {Math.abs(marketOverview.changePercent).toFixed(2)}%
        </p>

        <p className="text-[11px] font-bold text-[#648770]">
          vs previous price
        </p>
      </div>
    ) : (
      <div className="rounded-2xl bg-[#f4f7f5] px-5 py-4 text-center">
        <p className="text-sm font-black text-[#648770]">
          No comparison yet
        </p>
      </div>
    )}
  </div>
</div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={openTrendPageFast}
                    className="flex min-h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#078a36] to-[#0ca443] px-6 font-black text-white shadow-lg shadow-[#078a36]/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <span className="material-symbols-outlined">
                      monitoring
                    </span>
                    View Price Trend
                  </button>

                  <button
                    type="button"
                    onClick={onWhatsAppSupport}
                    className="flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#078a36] bg-white px-6 font-black text-[#078a36] transition hover:bg-[#effaf3]"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    WhatsApp Enquiry
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Product information strip */}
          <section className="mt-5 grid overflow-hidden rounded-[24px] border border-[#dde8e1] bg-white shadow-[0_8px_28px_rgba(17,23,19,0.045)] sm:grid-cols-2 lg:grid-cols-6">
            {[
              { icon: "category", label: "Type", value: grade },
              {
                icon: "inventory_2",
                label: "Packaging",
                value: packagingText,
              },
              { icon: "location_on", label: "Origin", value: origin },
              {
                icon: ship?.icon || "local_shipping",
                label: "Shipment",
                value: ship?.text || "Not specified",
              },
              { icon: "scale", label: "Unit", value: unit },
              {
                icon: "storefront",
                label: "Market Source",
                value: "Al Aweer",
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className={[
                  "flex min-w-0 items-center gap-3 px-4 py-4",
                  index > 0 ? "border-t border-[#e6ede8] sm:border-t-0" : "",
                  index % 2 === 1 ? "sm:border-l" : "",
                  index > 1 ? "lg:border-l" : "",
                ].join(" ")}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf8f1] text-[#078a36]">
                  <span className="material-symbols-outlined text-lg">
                    {item.icon}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#648770]">
                    {item.label}
                  </p>
                  <p
                    className="truncate text-sm font-black text-[#111713]"
                    title={item.value}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* Price overview and preview */}
          <section className="mt-5 grid gap-5 xl:grid-cols-2">
            <div className="rounded-[26px] border border-[#dde8e1] bg-white p-5 shadow-[0_8px_28px_rgba(17,23,19,0.045)] sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#078a36]">
                  analytics
                </span>
                <h2 className="text-xl font-black text-[#111713]">
                  Market Price Overview
                </h2>
                <span className="text-sm font-medium text-[#648770]">
                  (Al Aweer)
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Current Price",
                    value: formatPrice(marketOverview.current),
                    tone: "text-[#078a36]",
                  },
                  {
                    label: "Previous Price",
                    value: formatPrice(marketOverview.previous),
                    tone: "text-[#111713]",
                  },
                  {
                    label: "Highest Price",
                    value: formatPrice(marketOverview.highest),
                    tone: "text-[#d12f2f]",
                  },
                  {
                    label: "Lowest Price",
                    value: formatPrice(marketOverview.lowest),
                    tone: "text-[#1467d4]",
                  },
                  {
                    label: "Average Price",
                    value: formatPrice(marketOverview.average),
                    tone: "text-[#078a36]",
                  },
                  {
                    label: "Median Price",
                    value: formatPrice(marketOverview.median),
                    tone: "text-[#6b21a8]",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#e1e9e4] bg-[#fcfdfc] p-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#648770]">
                      {stat.label}
                    </p>
                    <p className={`mt-2 text-lg font-black ${stat.tone}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[0.8fr_1.7fr]">
                <div className="flex items-center gap-3 rounded-2xl border border-[#e1e9e4] bg-[#fcfdfc] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1e7] text-[#ec6b19]">
                    <span className="material-symbols-outlined">
                      data_exploration
                    </span>
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#648770]">
                      Total Updates
                    </p>
                    <p className="text-lg font-black text-[#111713]">
                      {marketOverview.updates}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#e1e9e4] bg-[#fcfdfc] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf8f1] text-[#078a36]">
                    <span className="material-symbols-outlined">
                      calendar_month
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#648770]">
                      Visible Period
                    </p>
                    <p className="truncate text-base font-black text-[#111713]">
                      {marketOverview.from
                        ? `${formatShortDate(marketOverview.from)} – ${formatShortDate(
                            marketOverview.to,
                          )}`
                        : "Price history will appear here"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-[26px] border border-[#dde8e1] bg-white p-5 shadow-[0_8px_28px_rgba(17,23,19,0.045)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#111713]">
                    Price Trend Preview
                  </h2>
                  <p className="text-sm font-medium text-[#648770]">
                    Last 1 year • Real Al Aweer history
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf8f1] text-[#078a36]">
                  <span className="material-symbols-outlined text-xl">
                    monitoring
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={openTrendPageFast}
                className={[
  "group relative flex-1 overflow-hidden rounded-2xl border border-[#e1e9e4] bg-gradient-to-b from-white to-[#f7fbf8] text-left",
  sparklinePath ? "min-h-[230px]" : "min-h-[150px]",
].join(" ")}
                title="Open detailed price analysis"
              >
                {sparklinePath ? (
                  <svg
                    viewBox="0 0 520 180"
                    preserveAspectRatio="none"
                    className="absolute inset-x-5 bottom-10 top-5 h-[calc(100%-60px)] w-[calc(100%-40px)]"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="premiumTrendFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#0c9a40" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#0c9a40" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`${sparklinePath} L 520 180 L 0 180 Z`}
                      fill="url(#premiumTrendFill)"
                    />
                    <path
                      d={sparklinePath}
                      fill="none"
                      stroke="#078a36"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf8f1] text-[#078a36]">
    <span className="material-symbols-outlined">monitoring</span>
  </span>

  <p className="font-black text-[#111713]">
    Market history will appear here
  </p>

  <p className="max-w-xs text-sm font-medium text-[#648770]">
    Historical prices will be shown after more Al Aweer updates are available.
  </p>
</div>
                )}

               {sparklinePath && (
  <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[10px] font-bold text-[#648770]">
    <span>{formatShortDate(marketOverview.from)}</span>
    <span>{formatShortDate(marketOverview.to)}</span>
  </div>
)}
              </button>

              <p className="mt-3 text-center text-xs font-medium text-[#648770]">
                View the full interactive chart with detailed market insights
              </p>

              <button
                type="button"
                onClick={openTrendPageFast}
                className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#078a36] bg-white font-black text-[#078a36] transition hover:bg-[#effaf3]"
              >
                <span className="material-symbols-outlined">
                  monitoring
                </span>
                Open Detailed Price Analysis
              </button>
            </div>
          </section>

          {/* Product details and benefits */}
          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-[26px] border border-[#dde8e1] bg-white p-6 shadow-[0_8px_28px_rgba(17,23,19,0.045)]">
              <span className="pointer-events-none absolute -bottom-10 -right-6 text-[170px] text-[#edf8f1]">
                <span className="material-symbols-outlined text-[170px]">
                  eco
                </span>
              </span>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#078a36]">
                    eco
                  </span>
                  <h2 className="text-xl font-black text-[#111713]">
                    About the Product
                  </h2>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4f6f5c]">
                  {title} is selected for consistent quality, dependable
                  grading and reliable supply. It is suitable for restaurants,
                  groceries, resellers and other B2B customers who need clear
                  market information before purchasing.
                </p>

                <div className="mt-5 space-y-3">
                  {qualityPoints.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 text-sm font-medium text-[#33443a]"
                    >
                      <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#078a36]">
                        check_circle
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-[#dde8e1] bg-white p-6 shadow-[0_8px_28px_rgba(17,23,19,0.045)]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#078a36]">
                  shield
                </span>
                <h2 className="text-xl font-black text-[#111713]">
                  Why Source from MyVegmarket?
                </h2>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {sourceBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf8f1] text-[#078a36]">
                      <span className="material-symbols-outlined">
                        {benefit.icon}
                      </span>
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-[#078a36]">
                        {benefit.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#4f6f5c]">
                        {benefit.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bulk enquiry */}
          <section className="mt-5 overflow-hidden rounded-[28px] border border-[#d9e9df] bg-gradient-to-r from-[#f0faf4] via-white to-[#edf8f1] p-4 shadow-[0_8px_28px_rgba(17,23,19,0.045)] sm:p-5">
            <div className="grid items-center gap-6 lg:grid-cols-[0.8fr_1.3fr_0.9fr]">
            <div className="relative flex min-h-[120px] items-center justify-center">
                <div className="absolute h-36 w-36 rounded-full bg-[#dff4e7]" />
                <img
                  src={productImage}
                  alt={`${title} bulk supply`}
                  className="relative h-28 w-full object-contain drop-shadow-lg"
                />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-[-0.03em] text-[#111713]">
                  Need {title} in bulk?
                </h2>
                <p className="mt-2 max-w-xl text-base leading-7 text-[#4f6f5c]">
                  Get current market guidance and sourcing support for your
                  restaurant, grocery, resale or export requirement.
                </p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#315f45]">
                  {["Daily Price Updates", "Best Market Rates", "Sourcing Support"].map(
                    (item) => (
                      <span key={item} className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[17px] text-[#078a36]">
                          check_circle
                        </span>
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={onWhatsAppSupport}
                  className="flex min-h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#078a36] to-[#0ca443] px-6 font-black text-white shadow-lg shadow-[#078a36]/20 transition hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined">chat</span>
                  WhatsApp Support
                </button>

                <button
                  type="button"
                  onClick={onCallSupport}
                  className="flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#078a36] bg-white px-6 font-black text-[#078a36] transition hover:bg-[#effaf3]"
                >
                  <span className="material-symbols-outlined">call</span>
                  Call Support
                </button>
              </div>
            </div>
          </section>

          {!isAlAweerLite && (
            <section className="mt-5 rounded-[26px] border border-[#dde8e1] bg-white p-6 shadow-[0_8px_28px_rgba(17,23,19,0.045)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#111713]">
                    Looking for a custom quantity?
                  </h2>
                  <p className="mt-1 text-sm font-medium text-[#648770]">
                    Send your quantity, packaging and delivery requirement to
                    our sourcing team.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onWhatsAppSupport}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#111713] px-6 font-black text-white transition hover:opacity-90"
                >
                  <span className="material-symbols-outlined">
                    request_quote
                  </span>
                  Request Quote
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}