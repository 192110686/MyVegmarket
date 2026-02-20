"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation"; // ✅ added
import type { DbProduct, DbCategory } from "@/lib/productsDb";

/**
 * NOTE:
 * - This component is now DB-driven.
 * - It expects `products` to be passed from the server page.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function storagePublicUrl(path?: string | null) {
  if (!path) return "";
  if (!SUPABASE_URL) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is missing in .env.local");
    return "";
  }
  return `${SUPABASE_URL}/storage/v1/object/public/product_images/${path}`;
}

const CATEGORY_META: Record<DbCategory, { title: string; desc: string }> = {
  vegetables: {
    title: "Vegetables",
    desc: "Compare Al Aweer rates with MyVegMarket pricing. Updated regularly.",
  },
  fruits: {
    title: "Fruits",
    desc: "Premium imports and seasonal fruits with clear market pricing.",
  },
  spices: {
    title: "Spices",
    desc: "Whole and ground spices for restaurants, caterers and bulk kitchens.",
  },
  nuts: {
    title: "Nuts & Dry Fruits",
    desc: "Premium nuts and dry fruits for retail, horeca and catering supply.",
  },
  eggs: {
    title: "Eggs",
    desc: "Fresh egg sourcing with daily supply for UAE businesses.",
  },
  oils: {
    title: "Cooking Oils",
    desc: "Reliable cooking oils for bulk usage—restaurants, hotels and catering.",
  },
};

function safeImg(url?: string | null) {
  return (
    url ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
  );
}

function formatAED(n?: number | null) {
  const num = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `AED ${num.toFixed(2)}`;
}

/** ✅ Sort should use ONLY Al Aweer / Market rate */
function getMarketSortPrice(p: DbProduct): number | null {
  const market = Number(p.market_price_aed);
  if (Number.isFinite(market) && market > 0) return market;
  return null; // missing/0 => push to bottom
}

export default function CategoryClient({
  category,
  products,
}: {
  category: DbCategory;
  products: DbProduct[];
}) {
  const cat = category;
  const meta = CATEGORY_META[cat];

  const pathname = usePathname(); // ✅ added (we will pass this to containers page)

  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("All");
  // Keeping these for UI compatibility (DB currently doesn’t store type yet)
  const [type, setType] = useState<"All" | "Organic" | "Regular">("All");
  const [sort, setSort] = useState<"low" | "high">("low");

  // ✅ DB is source of truth
  const baseList = useMemo(() => products, [products]);

  const origins = useMemo(() => {
    const cleaned = baseList
      .map((p) => (p.origin_country || "").trim())
      .filter(Boolean);

    const set = new Set(cleaned.map((x) => x.toLowerCase()));

    // keep display nicely (Title Case)
    const display = Array.from(set).map((x) => x[0].toUpperCase() + x.slice(1));

    return ["All", ...display];
  }, [baseList]);

  // ✅ Always show like your old UI
  const showOriginFilter = true;
  const showTypeFilter = true;

  const filtered = useMemo(() => {
    let list = [...baseList];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((p) => {
        const subtitle = (p.packaging ?? p.unit ?? "").toLowerCase();
        const org = (p.origin_country ?? "").toLowerCase();
        return (
          p.name.toLowerCase().includes(s) ||
          subtitle.includes(s) ||
          org.includes(s)
        );
      });
    }

    if (showOriginFilter && origin !== "All") {
      const o = origin.trim().toLowerCase();
      list = list.filter(
        (p) => (p.origin_country || "").trim().toLowerCase() === o
      );
    }

    // No type in DB yet, keep logic for future
    if (showTypeFilter && type !== "All") {
      // placeholder for future type column
    }

    // ✅ FIXED SORT: ONLY Al Aweer/Market rate + missing prices always at bottom + stable sort
    const decorated = list.map((p, idx) => ({
      p,
      idx,
      price: getMarketSortPrice(p),
    }));

    decorated.sort((a, b) => {
      const aMissing = a.price === null;
      const bMissing = b.price === null;

      // Missing/0 market rates go to bottom
      if (aMissing && !bMissing) return 1;
      if (!aMissing && bMissing) return -1;

      // Both missing -> keep original order
      if (aMissing && bMissing) return a.idx - b.idx;

      // Both have prices
      const diff =
        sort === "low" ? a.price! - b.price! : b.price! - a.price!;
      return diff !== 0 ? diff : a.idx - b.idx;
    });

    return decorated.map((x) => x.p);
  }, [baseList, search, origin, type, sort, showOriginFilter, showTypeFilter]);

  const handleDownloadPdf = async () => {
    const qs = new URLSearchParams({
      category: cat,
      search,
      origin,
      type, // kept for your existing API signature
      sort,
    });

    const url = `/api/category-report?${qs.toString()}`;
    const filename = `myvegmarket-${cat}-price-report.pdf`;

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
          text: `${meta.title} Price Report (PDF)`,
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

  const rateLabel =
    cat === "vegetables" || cat === "fruits" ? "AL AWEER RATE" : "MARKET RATE";

  return (
    <main className="bg-[#f6f8f7] min-h-screen px-6 lg:px-20 pt-10 pb-24">
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-[#648770] mb-6">
          <Link className="hover:text-[#1db954]" href="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <span className="text-[#111713] font-bold">{meta.title}</span>
        </div>

        {/* Heading */}
        <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black tracking-tight text-[#111713] leading-[1.05]">
              {meta.title}
            </h1>
            <p className="text-[#648770] text-lg font-medium mt-3 max-w-xl">
              {meta.desc}
            </p>
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

        {/* Filter Bar */}
        <div className="bg-white text-[#111713] rounded-2xl p-4 mb-10 shadow-sm border border-[#e0e8e3]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
              {/* Search */}
              <div className="relative w-full min-w-0">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#648770]">
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${meta.title.toLowerCase()}...`}
                  className="h-11 w-full min-w-0 rounded-full bg-[#f0f4f2] pl-12 pr-4 text-sm font-semibold text-[#111713] placeholder:text-[#648770] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
                />
              </div>

              {/* Origin */}
              {showOriginFilter && (
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="h-11 w-full min-w-0 rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold text-[#111713] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
                >
                  {origins.map((o) => (
                    <option key={o} value={o}>
                      Origin: {o}
                    </option>
                  ))}
                </select>
              )}

              {/* Type (placeholder for future DB field) */}
              {showTypeFilter && (
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="h-11 w-full min-w-0 rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold text-[#111713] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
                >
                  <option value="All">Type: All</option>
                  <option value="Organic">Type: Organic</option>
                  <option value="Regular">Type: Regular</option>
                </select>
              )}

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="h-11 w-full min-w-0 rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold text-[#111713] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
              >
                <option value="low">Sort: Price (Low)</option>
                <option value="high">Sort: Price (High)</option>
              </select>
            </div>

            <div className="text-sm font-medium text-[#648770] lg:text-right">
              Showing {filtered.length} results
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#e0e8e3] shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative h-[210px] overflow-hidden bg-[#f0f4f2]">
                <img
                  src={safeImg((p as any).image_public_url)}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";
                  }}
                />

                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#111713] flex items-center gap-2 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1db954]" />
                  {p.origin_country || "Origin"}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold leading-tight mb-1 text-[#111713]">
                    {p.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#648770]">
                    {p.packaging ?? p.unit ?? ""}
                  </p>
                </div>

                <div className="rounded-2xl p-4 mb-5 border border-[#e0e8e3] bg-[#f6f8f7]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-[#6B7C72]">
                        {rateLabel}
                      </div>
                      <div className="mt-1 text-[15px] font-extrabold text-[#111713] tabular-nums">
                        {formatAED(p.market_price_aed)}
                      </div>
                    </div>

                    <div className="min-w-0 text-right">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-[#6B7C72]">
                        MyVegMarket
                      </div>
                      <div className="mt-1 text-[15px] font-extrabold text-[#0B5D1E] tabular-nums">
                        {formatAED(p.myveg_price_aed)}
                      </div>
                    </div>
                  </div>

                  <div className="my-3 h-px bg-[#e0e8e3]" />

                  <div className="flex items-center justify-between text-[12px] font-semibold text-[#648770]">
                    <span>Unit</span>
                    <span className="text-[#111713]/80">{p.unit ?? ""}</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-3 items-center">
                  {/* ✅ UPDATED: pass current category URL so containers page can go back without 404 */}
                  <Link
                    href={`/product/${p.slug}/containers?back=${encodeURIComponent(
                      pathname || "/"
                    )}`}
                    className="flex-1 bg-[#1db954] text-white font-extrabold text-sm h-11 rounded-full hover:opacity-95 transition-opacity flex items-center justify-center"
                  >
                    View Containers
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 text-[#648770] font-medium">
            No products available in this category yet.
          </div>
        )}
      </div>
    </main>
  );
}
