"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabaseClient";

type ProductCategory = "vegetables" | "fruits" | "spices" | "nuts" | "eggs" | "oils";

const ALL_CATEGORIES: ProductCategory[] = [
  "vegetables",
  "fruits",
  "spices",
  "nuts",
  "eggs",
  "oils",
];

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  unit: string;
  origin_country: string | null;
  packaging: string | null;
  active: boolean;
  sort_order: number;
};

type DayAgg = {
  min: number | null;
  max: number | null;
  last: number | null;
  lastTime: string | null; // ISO
};

type RowVM = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  unit: string;
  origin: string;
  packaging?: string | null;

  // computed
  minPrice: number | null;
  maxPrice: number | null;
  marketPrice: number | null;
  lastTimeLabel: string | null; // "10:39 AM"
};

function safeSupabase(): SupabaseClient | null {
  try {
    return getSupabase();
  } catch {
    return null;
  }
}

function labelCat(c: ProductCategory) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

/** ✅ display only numbers (no AED inside cell) */
function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

function fmtTimeOnly(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

/** yyyy-mm-dd for input[type=date] */
function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convert yyyy-mm-dd -> { startISO, endISO } (local day range -> ISO UTC) */
function dayRangeISO(ymd: string) {
  const [yy, mm, dd] = ymd.split("-").map((x) => Number(x));
  const start = new Date(yy, (mm || 1) - 1, dd || 1, 0, 0, 0, 0);
  const end = new Date(yy, (mm || 1) - 1, dd || 1, 23, 59, 59, 999);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export default function AlAweerPricesPage() {
  const router = useRouter();

  const openProduct = (slug: string) => {
    router.push(`/product/${slug}?lite=1`);
  };

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // ✅ calendar date (default: today)
  const [selectedDate, setSelectedDate] = useState<string>(todayYMD());

  // filters
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("All");

  // category multi-select
  const [selectedCats, setSelectedCats] = useState<ProductCategory[]>([...ALL_CATEGORIES]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement | null>(null);

  // data
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [aggBySlug, setAggBySlug] = useState<Record<string, DayAgg>>({});

  // close dropdown when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!catRef.current) return;
      if (!catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // load products + selected-day approved updates
  useEffect(() => {
    let mounted = true;
    const supabase = safeSupabase();

    async function load() {
      setLoading(true);
      setToast(null);

      if (!supabase) {
        setToast("Supabase client not ready. Please refresh.");
        setLoading(false);
        return;
      }

      // 1) load products
      const { data: pData, error: pErr } = await supabase
        .from("products")
        .select("id,slug,name,category,unit,origin_country,packaging,active,sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
        .limit(5000);

      if (!mounted) return;

      if (pErr) {
        setToast(pErr.message);
        setProducts([]);
        setAggBySlug({});
        setLoading(false);
        return;
      }

      const dbProducts = ((pData as any) ?? []) as DbProduct[];
      setProducts(dbProducts);

      // 2) load SELECTED DAY approved updates (for min/max/last/time)
      const { startISO, endISO } = dayRangeISO(selectedDate);

      const { data: uData, error: uErr } = await supabase
        .from("price_updates")
        .select("product_key,price,reviewed_at,published_at,status")
        .eq("status", "approved")
        .gte("published_at", startISO)
        .lte("published_at", endISO)
        .order("published_at", { ascending: true })
        .limit(10000);

      if (!mounted) return;

      if (uErr) {
        setToast(uErr.message);
        setAggBySlug({});
        setLoading(false);
        return;
      }

      const map: Record<string, DayAgg> = {};

      for (const r of (uData as any[]) ?? []) {
        const slug = (r.product_key || "").trim();
        const price = Number(r.price);
        const t = (r.published_at || r.reviewed_at || null) as string | null;

        if (!slug || !Number.isFinite(price)) continue;

        if (!map[slug]) map[slug] = { min: price, max: price, last: price, lastTime: t };
        else {
          map[slug].min = map[slug].min == null ? price : Math.min(map[slug].min, price);
          map[slug].max = map[slug].max == null ? price : Math.max(map[slug].max, price);
          map[slug].last = price; // ordered asc => last assignment becomes latest
          map[slug].lastTime = t;
        }
      }

      setAggBySlug(map);
      setLoading(false);
    }

    load();

    // ✅ auto refresh every 15 seconds (respects selectedDate)
    const interval = setInterval(load, 15_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedDate]);

  const origins = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) set.add((p.origin_country || "—").trim() || "—");
    return ["All", ...Array.from(set)];
  }, [products]);

  const showOriginFilter = useMemo(() => origins.length > 2, [origins]);

  const selectedCatsText = useMemo(() => {
    if (selectedCats.length === ALL_CATEGORIES.length) return "All";
    if (selectedCats.length === 0) return "None";
    return selectedCats.map(labelCat).join(", ");
  }, [selectedCats]);

  const handleToggleCategory = (c: ProductCategory) => {
    setSelectedCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };
  const handleSelectAllCats = () => setSelectedCats([...ALL_CATEGORIES]);
  const handleClearCats = () => setSelectedCats([]);

  // build view model rows
  const rows: RowVM[] = useMemo(() => {
    const list: RowVM[] = products.map((p) => {
      const agg = aggBySlug[p.slug] || { min: null, max: null, last: null, lastTime: null };
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        unit: p.unit,
        origin: (p.origin_country || "—").trim() || "—",
        packaging: p.packaging,

        minPrice: agg.min,
        maxPrice: agg.max,
        marketPrice: agg.last,
        lastTimeLabel: fmtTimeOnly(agg.lastTime),
      };
    });

    // category filter
    let filtered = list.filter((p) => selectedCats.includes(p.category));

    // search
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter((p) => {
        const subtitle = (p.packaging ?? p.unit ?? "").toLowerCase();
        return (
          p.name.toLowerCase().includes(s) ||
          subtitle.includes(s) ||
          p.origin.toLowerCase().includes(s)
        );
      });
    }

    // origin
    if (showOriginFilter && origin !== "All") filtered = filtered.filter((p) => p.origin === origin);

    // ✅ ALWAYS sort by Market low->high. If no price, push to bottom.
    filtered.sort((a, b) => {
      const av = a.marketPrice == null ? Number.POSITIVE_INFINITY : a.marketPrice;
      const bv = b.marketPrice == null ? Number.POSITIVE_INFINITY : b.marketPrice;
      return av - bv;
    });

    return filtered;
  }, [products, aggBySlug, selectedCats, search, showOriginFilter, origin]);

  // PDF download (keep your existing endpoint) — added date param (safe)
  const handleDownloadPdf = async () => {
    const qs = new URLSearchParams({
      search,
      origin,
      cats: selectedCats.join(","),
      date: selectedDate,
    });

    const url = `/api/al-aweer-report?${qs.toString()}`;
    const filename = "myvegmarket-al-aweer-price-report.pdf";

    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const file = new File([blob], filename, { type: "application/pdf" });

      // @ts-ignore
      if (navigator.canShare?.({ files: [file] })) {
        // @ts-ignore
        await navigator.share({
          files: [file],
          title: "MyVegMarket Price Report",
          text: "Al Aweer Price Report (PDF)",
        });
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="bg-[#f6f8f7] min-h-screen px-6 lg:px-20 pt-10 pb-24">
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-[#648770] mb-6">
          <Link className="hover:text-[#1db954]" href="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-[#111713] font-bold">Al Aweer Prices</span>
        </div>

        {/* Heading + PDF */}
        <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black tracking-tight text-[#111713] leading-[1.05]">
              Al Aweer Prices
            </h1>
            <p className="text-[#648770] text-lg font-medium mt-3 max-w-xl">
              Approved on:{" "}
              <span className="font-bold text-[#111713]">{selectedDate}</span> • MIN / MAX + last
              Market (AED) & updated time.
            </p>

            {toast && (
              <div className="mt-3 bg-white border border-[#e0e8e3] rounded-xl px-4 py-3 text-[#111713] font-semibold">
                {toast}
              </div>
            )}
            {loading && !toast && <div className="mt-3 text-[#648770] font-semibold">Loading…</div>}
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded-full h-12 px-6 bg-white border border-[#e0e8e3] text-[#111713] font-bold shadow-sm hover:shadow-md transition-all"
          >
            <span className="material-symbols-outlined">download</span>
            <span>Price Report (PDF)</span>
          </button>
        </div>

        {/* ✅ Filter Bar (Aligned) */}
        <div className="bg-white text-[#111713] rounded-2xl p-4 mb-10 shadow-sm border border-[#e0e8e3]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            {/* Search */}
            <div className="relative w-full lg:flex-[2] min-w-0">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#648770]">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-11 w-full rounded-full bg-[#f0f4f2] pl-12 pr-4 text-sm font-semibold text-[#111713] placeholder:text-[#648770] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
              />
            </div>

            {/* Categories dropdown */}
            <div className="relative w-full lg:flex-[2] min-w-0" ref={catRef}>
              <button
                type="button"
                onClick={() => setCatOpen((v) => !v)}
                className="h-11 w-full rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold outline-none flex items-center justify-between gap-2 text-[#111713] focus:ring-2 focus:ring-[#0B5D1E]/20"
              >
                <span className="truncate">
                  Category:{" "}
                  {selectedCats.length === ALL_CATEGORIES.length
                    ? "All"
                    : selectedCats.length === 0
                    ? "None"
                    : `${selectedCats.length} selected`}
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#648770] shrink-0">
                  expand_more
                </span>
              </button>

              {catOpen && (
                <div className="absolute z-20 mt-2 w-full sm:w-[320px] rounded-2xl border border-[#e0e8e3] bg-white shadow-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#111713]">Select Categories</span>
                    <button
                      type="button"
                      onClick={() => setCatOpen(false)}
                      className="text-[#648770] hover:text-[#111713]"
                      aria-label="Close"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={handleSelectAllCats}
                      className="h-9 px-3 rounded-full border border-[#e0e8e3] bg-white text-sm font-bold hover:bg-[#f6f8f7]"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearCats}
                      className="h-9 px-3 rounded-full border border-[#e0e8e3] bg-white text-sm font-bold hover:bg-[#f6f8f7]"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-2">
                    {ALL_CATEGORIES.map((c) => {
                      const checked = selectedCats.includes(c);
                      return (
                        <label
                          key={c}
                          className="flex items-center gap-3 text-sm font-semibold text-[#111713] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleCategory(c)}
                            className="h-4 w-4 accent-[#1db954]"
                          />
                          {labelCat(c)}
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-[12px] font-semibold text-[#648770] break-words">
                    Selected: {selectedCatsText}
                  </div>
                </div>
              )}
            </div>

            {/* Origin */}
            {showOriginFilter && (
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="h-11 w-full lg:flex-[1.2] rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold text-[#111713] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
              >
                {origins.map((o) => (
                  <option key={o} value={o}>
                    Origin: {o}
                  </option>
                ))}
              </select>
            )}

            {/* Date */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-11 w-full lg:w-[220px] rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold text-[#111713] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
            />

            {/* Results */}
            <div className="text-sm font-medium text-[#648770] lg:ml-auto lg:text-right whitespace-nowrap">
              Showing {rows.length} results
            </div>
          </div>
        </div>

        {/* ✅ DESKTOP */}
        <div className="hidden md:block bg-white border border-[#e0e8e3] rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[3fr_1.5fr_1fr_1fr_1fr_1.2fr_1fr] gap-0 bg-green-600 text-white text-sm font-semibold">
            <div className="px-5 py-3">Product</div>
            <div className="px-5 py-3">Origin</div>
            <div className="px-5 py-3">Unit</div>
            <div className="px-5 py-3 text-right">MIN</div>
            <div className="px-5 py-3 text-right">MAX</div>
            <div className="px-5 py-3 text-right">Market (AED)</div>
            <div className="px-5 py-3 text-right">Time</div>
          </div>

          {rows.map((p, idx) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => openProduct(p.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openProduct(p.slug);
              }}
              className={`grid grid-cols-[3fr_1.5fr_1fr_1fr_1fr_1.2fr_1fr] gap-0 text-sm cursor-pointer transition-colors
                ${idx % 2 === 0 ? "bg-white" : "bg-[#f6f8f7]"}
                hover:bg-[#eaf3ee] focus:outline-none focus:ring-2 focus:ring-[#0B5D1E]/15`}
            >
              <div className="px-5 py-3 font-semibold text-[#111713]">{p.name}</div>
              <div className="px-5 py-3 text-[#111713]">{p.origin}</div>
              <div className="px-5 py-3 text-[#111713]">{p.unit}</div>

              <div className="px-5 py-3 text-right font-extrabold tabular-nums text-[#111713]">
                {formatPrice(p.minPrice)}
              </div>

              <div className="px-5 py-3 text-right font-extrabold tabular-nums text-[#111713]">
                {formatPrice(p.maxPrice)}
              </div>

              <div className="px-5 py-3 text-right font-extrabold tabular-nums text-[#111713]">
                {formatPrice(p.marketPrice)}
              </div>

              <div className="px-5 py-3 text-right font-semibold tabular-nums text-[#111713]">
                {p.lastTimeLabel || "—"}
              </div>
            </div>
          ))}
        </div>

        {/* ✅ MOBILE */}
        <div className="md:hidden space-y-3">
          {rows.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => openProduct(p.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openProduct(p.slug);
              }}
              className="bg-white border border-[#e0e8e3] rounded-2xl p-4 shadow-sm cursor-pointer
                         hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-extrabold text-[#111713] leading-tight">{p.name}</div>
                  <div className="mt-1 text-sm font-semibold text-[#648770]">
                    {p.origin} • {p.unit}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#648770]">
                    MIN:{" "}
                    <span className="text-[#111713] font-extrabold tabular-nums">
                      {formatPrice(p.minPrice)}
                    </span>{" "}
                    • MAX:{" "}
                    <span className="text-[#111713] font-extrabold tabular-nums">
                      {formatPrice(p.maxPrice)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6B7C72]">
                    Market (AED)
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-[#111713] tabular-nums">
                    {formatPrice(p.marketPrice)}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#648770]">
                    {p.lastTimeLabel || "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
