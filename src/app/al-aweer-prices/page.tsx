"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { PRODUCTS, Product, ProductCategory } from "@/lib/products";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ALL_CATEGORIES: ProductCategory[] = [
  "vegetables",
  "fruits",
  "spices",
  "nuts",
  "eggs",
  "oils",
];

function formatAED(n: number) {
  const num = Number.isFinite(n) ? n : 0;
  return `AED ${num.toFixed(2)}`;
}

function labelCat(c: ProductCategory) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

/** ✅ iOS detection (iPhone/iPad + iPadOS in desktop mode) */
function isIOS() {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1)
  );
}

/**
 * ✅ Safari rule: window.open must happen immediately inside click event
 * so we open a blank tab first, then later navigate it to the PDF blob URL.
 */
function openBlankTabIOS() {
  if (!isIOS()) return null;
  return window.open("", "_blank");
}

function savePdfSmart(doc: any, filename: string, iosTab: Window | null) {
  // iPhone/iOS: doc.save won't download reliably
  if (isIOS()) {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    if (iosTab) {
      iosTab.location.href = url;
    } else {
      // fallback if tab blocked
      window.location.href = url;
    }

    // revoke later (don't revoke immediately on iOS)
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
    return;
  }

  // Normal browsers (Android/PC)
  doc.save(filename);
}

export default function AlAweerPricesPage() {
      const router = useRouter();

  const openProduct = (id: string) => {
    router.push(`/product/${id}`);
  };
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("All");
  const [type, setType] = useState<"All" | "Organic" | "Regular">("All");
  const [sort, setSort] = useState<"low" | "high">("low");

  // ✅ category multi-select
  const [selectedCats, setSelectedCats] = useState<ProductCategory[]>([
    ...ALL_CATEGORIES,
  ]);

  // ✅ dropdown open state
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement | null>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!catRef.current) return;
      if (!catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const origins = useMemo(() => {
    const set = new Set(PRODUCTS.map((p) => p.origin));
    return ["All", ...Array.from(set)];
  }, []);

  const showTypeFilter = useMemo(() => PRODUCTS.some((p) => p.type), []);
  const showOriginFilter = useMemo(() => origins.length > 2, [origins]);

  const filtered = useMemo(() => {
    let list: Product[] = [...PRODUCTS];

    // category filter
    list = list.filter((p) => selectedCats.includes(p.category));

    // search
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((p) => {
        const subtitle = (p.packaging ?? p.subtitle ?? p.unit ?? "").toLowerCase();
        return (
          p.name.toLowerCase().includes(s) ||
          subtitle.includes(s) ||
          p.origin.toLowerCase().includes(s)
        );
      });
    }

    // origin
    if (showOriginFilter && origin !== "All") list = list.filter((p) => p.origin === origin);

    // type
    if (showTypeFilter && type !== "All") list = list.filter((p) => p.type === type);

    // sort by marketAvg
    list.sort((a, b) =>
      sort === "low" ? a.marketAvg - b.marketAvg : b.marketAvg - a.marketAvg
    );

    return list;
  }, [search, origin, type, sort, selectedCats, showOriginFilter, showTypeFilter]);

  const selectedCatsText = useMemo(() => {
    if (selectedCats.length === ALL_CATEGORIES.length) return "All";
    if (selectedCats.length === 0) return "None";
    return selectedCats.map(labelCat).join(", ");
  }, [selectedCats]);

  const handleToggleCategory = (c: ProductCategory) => {
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleSelectAllCats = () => setSelectedCats([...ALL_CATEGORIES]);
  const handleClearCats = () => setSelectedCats([]);
const handleDownloadPdf = async () => {
  const qs = new URLSearchParams({
    search,
    origin,
    type,
    sort,
    cats: selectedCats.join(","),
  });

  const url = `/api/al-aweer-report?${qs.toString()}`;
  const filename = "myvegmarket-al-aweer-price-report.pdf";

  try {
    // 1) Fetch the PDF bytes
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();

    // 2) Try Web Share (very user-friendly on iOS: Save to Files)
    // Works on Safari and sometimes other browsers too
    const file = new File([blob], filename, { type: "application/pdf" });

    // @ts-ignore (TS sometimes doesn't know canShare)
    if (navigator.canShare?.({ files: [file] })) {
      // @ts-ignore
      await navigator.share({
        files: [file],
        title: "MyVegMarket Price Report",
        text: "Al Aweer Price Report (PDF)",
      });
      return;
    }

    // 3) Try normal browser download (best for desktop/Android)
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);

    return;
  } catch (err) {
    // 4) Last fallback: open the PDF in a new tab (works in iOS Chrome/Google app)
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
              Filter market rates and download the same view as a PDF report.
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
            {/* LEFT: filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 min-w-0">
              {/* Search */}
              <div className="relative w-full min-w-0">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#648770]">
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="h-11 w-full min-w-0 rounded-full bg-[#f0f4f2] pl-12 pr-4 text-sm font-semibold text-[#111713] placeholder:text-[#648770] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
                />
              </div>

              {/* Categories dropdown */}
              <div className="relative w-full min-w-0" ref={catRef}>
                <button
                  type="button"
                  onClick={() => setCatOpen((v) => !v)}
                  className="h-11 w-full min-w-0 rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold outline-none flex items-center justify-between gap-2 text-[#111713] focus:ring-2 focus:ring-[#0B5D1E]/20"
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
                      <span className="text-sm font-bold text-[#111713]">
                        Select Categories
                      </span>
                      <button
                        type="button"
                        onClick={() => setCatOpen(false)}
                        className="text-[#648770] hover:text-[#111713]"
                        aria-label="Close"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          close
                        </span>
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
                  className="h-11 w-full min-w-0 rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold text-[#111713] outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
                >
                  {origins.map((o) => (
                    <option key={o} value={o}>
                      Origin: {o}
                    </option>
                  ))}
                </select>
              )}

              {/* Type */}
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
                <option value="low">Sort: Market (Low)</option>
                <option value="high">Sort: Market (High)</option>
              </select>
            </div>

            {/* RIGHT: count */}
            <div className="text-sm font-medium text-[#648770] lg:text-right">
              Showing {filtered.length} results
            </div>
          </div>
        </div>

        {/* Table view */}
        {/* ✅ MOBILE: premium stacked rows (no horizontal scroll) */}
        <div className="md:hidden space-y-3">
          {filtered.map((p) => (
  <div
    key={p.id}
    role="button"
    tabIndex={0}
    onClick={() => openProduct(p.id)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") openProduct(p.id);
    }}
    className="bg-white border border-[#e0e8e3] rounded-2xl p-4 shadow-sm cursor-pointer
               hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
  >

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-extrabold text-[#111713] leading-tight">
                    {p.name}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#648770]">
                    {p.origin} • {p.unit}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6B7C72]">
                    Market Rate
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-[#111713] tabular-nums">
                    {formatAED(p.marketAvg)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ DESKTOP: table view */}
        <div className="hidden md:block bg-white border border-[#e0e8e3] rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-0 bg-green-600 text-white text-sm font-semibold">
            <div className="col-span-6 px-5 py-3">Product</div>
            <div className="col-span-3 px-5 py-3">Origin</div>
            <div className="col-span-1 px-5 py-3">Unit</div>
            <div className="col-span-2 px-5 py-3 text-right">Market Rate</div>
          </div>

          {filtered.map((p, idx) => (
  <div
    key={p.id}
    role="button"
    tabIndex={0}
    onClick={() => openProduct(p.id)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") openProduct(p.id);
    }}
    className={`grid grid-cols-12 gap-0 text-sm cursor-pointer transition-colors
      ${idx % 2 === 0 ? "bg-white" : "bg-[#f6f8f7]"}
      hover:bg-[#eaf3ee] focus:outline-none focus:ring-2 focus:ring-[#0B5D1E]/15`}
  >

              <div className="col-span-6 px-5 py-3 font-semibold text-[#111713]">
                {p.name}
              </div>
              <div className="col-span-3 px-5 py-3 text-[#111713]">{p.origin}</div>
              <div className="col-span-1 px-5 py-3 text-[#111713]">{p.unit}</div>
              <div className="col-span-2 px-5 py-3 text-right font-extrabold tabular-nums text-[#111713]">
                {formatAED(p.marketAvg)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
