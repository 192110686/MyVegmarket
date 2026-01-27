"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PRODUCTS, Product, ProductCategory } from "@/lib/products";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORY_META: Record<ProductCategory, { title: string; desc: string }> = {
  vegetables: {
    title: "Vegetables",
    desc: "Real-time price comparison across Dubai’s leading wholesale markets. Updated hourly.",
  },
  fruits: {
    title: "Fruits",
    desc: "Premium imports and seasonal fruits with transparent market pricing.",
  },
  eggs: {
    title: "Eggs",
    desc: "Local fresh egg sourcing with daily market insights and stable supply.",
  },
};

function safeImg(url: string) {
  return (
    url ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
  );
}

function formatAED(n: number) {
  const num = Number.isFinite(n) ? n : 0;
  return `AED ${num.toFixed(2)}`;
}

export default function CategoryClient({ category }: { category: string }) {
  const cat = (category?.toLowerCase() as ProductCategory) || "vegetables";
  const meta = CATEGORY_META[cat] ?? {
    title: "Products",
    desc: "Browse premium categories.",
  };

  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("All");
  const [type, setType] = useState<"All" | "Organic" | "Regular">("All");
  const [sort, setSort] = useState<"low" | "high">("low");

  const origins = useMemo(() => {
    const set = new Set(
      PRODUCTS.filter((p) => p.category === cat).map((p) => p.origin)
    );
    return ["All", ...Array.from(set)];
  }, [cat]);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => p.category === cat);

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.subtitle.toLowerCase().includes(s) ||
          p.origin.toLowerCase().includes(s)
      );
    }

    if (origin !== "All") list = list.filter((p) => p.origin === origin);
    if (type !== "All") list = list.filter((p) => p.type === type);

    list = [...list].sort((a, b) =>
      sort === "low" ? a.myPrice - b.myPrice : b.myPrice - a.myPrice
    );

    return list;
  }, [cat, search, origin, type, sort]);

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      const title = `MyVegMarket - ${meta.title} Price Report`;
      const generated = `Generated: ${new Date().toLocaleString()}`;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(title, 40, 44);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(generated, 40, 62);

      const rows = filtered.map((p) => {
        const savePct =
          p.marketAvg && p.marketAvg > 0
            ? (((p.marketAvg - p.myPrice) / p.marketAvg) * 100).toFixed(1)
            : "0.0";

        return [
          p.name,
          p.origin,
          p.unit,
          formatAED(p.marketAvg),
          formatAED(p.myPrice),
          `${savePct}%`,
        ];
      });

      autoTable(doc, {
        startY: 80,
        head: [["Product", "Origin", "Unit", "Al Aweer Rate", "MyVegMarket", "Save"]],
        body: rows,
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [29, 185, 84], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 170 },
          1: { cellWidth: 80 },
          2: { cellWidth: 60 },
          3: { cellWidth: 90 },
          4: { cellWidth: 90 },
          5: { cellWidth: 60 },
        },
      });

      const fileName = `myvegmarket-${cat}-price-report.pdf`;
      doc.save(fileName);
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
        <div className="bg-white rounded-2xl p-4 mb-10 shadow-sm border border-[#e0e8e3]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#648770]">
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${meta.title.toLowerCase()}...`}
                  className="h-11 w-80 rounded-full bg-[#f0f4f2] pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B5D1E]/20"
                />
              </div>

              {/* Origin */}
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="h-11 rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold outline-none"
              >
                {origins.map((o) => (
                  <option key={o} value={o}>
                    Origin: {o}
                  </option>
                ))}
              </select>

              {/* Type */}
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="h-11 rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold outline-none"
              >
                <option value="All">Type: All</option>
                <option value="Organic">Type: Organic</option>
                <option value="Regular">Type: Regular</option>
              </select>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="h-11 rounded-full bg-[#f0f4f2] px-4 text-sm font-semibold outline-none"
              >
                <option value="low">Sort: Price (Low)</option>
                <option value="high">Sort: Price (High)</option>
              </select>
            </div>

            <div className="text-sm font-medium text-[#648770]">
              Showing {filtered.length} results
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p: Product) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#e0e8e3] shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              {/* Image */}
              <div className="relative h-[210px] overflow-hidden bg-[#f0f4f2]">
                <img
                  src={safeImg(p.image)}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";
                  }}
                />

                {/* Origin pill */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#111713] flex items-center gap-2 shadow-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${p.badgeColor}`} />
                  {p.origin}
                </div>

                {/* Fav */}
                <button
                  type="button"
                  className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center text-[#648770] hover:text-red-500 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    favorite
                  </span>
                </button>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold leading-tight mb-1 text-[#111713]">
                    {p.name}
                  </h3>
                  <p className="text-sm font-medium text-[#648770]">
                    {p.subtitle}
                  </p>
                </div>

                {/* Price box */}
                <div className="rounded-2xl p-4 mb-5 border border-[#e0e8e3] bg-[#f6f8f7]">
                  <div className="flex justify-between items-center mb-2 text-[11px] font-bold text-[#648770] uppercase">
                    <span>AL AWEER RATE</span>
                    <span className="line-through">{formatAED(p.marketAvg)}</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-[#1db954]">
                      MyVegMarket Price
                    </span>
                    <span className="text-2xl font-black text-[#1db954]">
                      {formatAED(p.myPrice)}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-auto flex gap-3 items-center">
                  <Link
                    href={`/product/${p.id}`}
                    className="flex-1 bg-[#1db954] text-white font-extrabold text-sm h-11 rounded-full hover:opacity-95 transition-opacity flex items-center justify-center"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    className="w-11 h-11 rounded-full border border-[#e0e8e3] flex items-center justify-center text-[#111713] hover:bg-[#f0f4f2] transition-colors"
                  >
                    <span className="material-symbols-outlined">call</span>
                  </button>

                  <button
                    type="button"
                    className="w-11 h-11 rounded-full border border-[#e0e8e3] flex items-center justify-center text-[#1db954] hover:bg-[#f0f4f2] transition-colors"
                  >
                    <span className="material-symbols-outlined">forum</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-[#648770] text-sm font-medium">
            Showing {Math.min(filtered.length, 12)} of {filtered.length} products
          </p>
          <div className="w-full max-w-xs h-1.5 bg-[#f0f4f2] rounded-full overflow-hidden">
            <div className="w-[40%] h-full bg-[#1db954] rounded-full" />
          </div>
          <button
            type="button"
            className="mt-4 min-w-[220px] h-12 bg-white border border-[#e0e8e3] rounded-full font-bold text-sm shadow-sm hover:bg-[#f0f4f2] transition-colors"
          >
            Load More Results
          </button>
        </div>
      </div>
    </main>
  );
}
