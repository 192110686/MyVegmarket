"use client";

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

export default function AlAweerPricesPage() {
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

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      const title = `MyVegMarket - Al Aweer Price Report`;
      const generated = `Generated: ${new Date().toLocaleString()}`;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(title, 40, 44);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(generated, 40, 62);

      const totalMarket = filtered.reduce((sum, p) => sum + (p.marketAvg || 0), 0);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(
        `Filters: Categories: ${selectedCatsText} | Origin: ${origin} | Type: ${type} | Sort: ${
          sort === "low" ? "Market (Low)" : "Market (High)"
        } | Search: ${search.trim() ? `"${search.trim()}"` : "—"}`,
        40,
        82,
        { maxWidth: 520 }
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(
        `Summary: Items ${filtered.length} | Total Market: ${formatAED(totalMarket)}`,
        40,
        105
      );

      const rows = filtered.map((p) => [
        p.name,
        p.origin,
        p.unit,
        formatAED(p.marketAvg),
      ]);

      autoTable(doc, {
        startY: 125,
        head: [["Product", "Origin", "Unit", "Market Rate"]],
        body: rows,

        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: {
          fillColor: [29, 185, 84],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },

        // ✅ centered table so it doesn’t stick to extreme right
        tableWidth: 520,
        margin: { left: 60 },

        columnStyles: {
  0: { cellWidth: 240 },             // Product (a bit wider)
  1: { cellWidth: 110 },             // Origin (same)
  2: { cellWidth: 90, halign: "left" },  // ✅ Unit wider (reduces the weird gap)
  3: { cellWidth: 80, halign: "right" }, // ✅ Market smaller but right aligned
},


        // ✅ Fix: Market Rate header alignment matches values
        didParseCell: (data) => {
          if (data.section === "head" && data.column.index === 3) {
            data.cell.styles.halign = "right";
          }
        },
      });

      doc.save(`myvegmarket-al-aweer-price-report.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed. Check console for details.");
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
      className="bg-white border border-[#e0e8e3] rounded-2xl p-4 shadow-sm"
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

{/* ✅ DESKTOP: table view (clean, no min-w forcing mobile scroll) */}
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
      className={`grid grid-cols-12 gap-0 text-sm ${
        idx % 2 === 0 ? "bg-white" : "bg-[#f6f8f7]"
      }`}
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
