"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PRODUCTS, Product, ProductCategory } from "@/lib/products";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORY_META: Record<ProductCategory, { title: string; desc: string }> = {
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

function parseCategory(raw: string): ProductCategory {
  const c = (raw || "").toLowerCase();
  const allowed: ProductCategory[] = [
    "vegetables",
    "fruits",
    "spices",
    "nuts",
    "eggs",
    "oils",
  ];
  return allowed.includes(c as ProductCategory)
    ? (c as ProductCategory)
    : "vegetables";
}
function isIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
}

function savePdfSmart(doc: any, filename: string) {
  // iPhone/iOS: doc.save won't download, so open PDF in new tab
  if (isIOS()) {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }

  // Normal browsers (Android/PC)
  doc.save(filename);
}


export default function CategoryClient({ category }: { category: string }) {
  const cat = parseCategory(category);
  const meta = CATEGORY_META[cat];

  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("All");
  const [type, setType] = useState<"All" | "Organic" | "Regular">("All");
  const [sort, setSort] = useState<"low" | "high">("low");

  const baseList = useMemo(
    () => PRODUCTS.filter((p) => p.category === cat),
    [cat]
  );

  const origins = useMemo(() => {
    const set = new Set(baseList.map((p) => p.origin));
    return ["All", ...Array.from(set)];
  }, [baseList]);

  const showTypeFilter = useMemo(() => baseList.some((p) => p.type), [baseList]);
  const showOriginFilter = useMemo(() => origins.length > 2, [origins]);

  const filtered = useMemo(() => {
    let list = [...baseList];

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

    if (showOriginFilter && origin !== "All") list = list.filter((p) => p.origin === origin);
    if (showTypeFilter && type !== "All") list = list.filter((p) => p.type === type);

    list.sort((a, b) =>
      sort === "low" ? a.myPrice - b.myPrice : b.myPrice - a.myPrice
    );
    return list;
  }, [baseList, search, origin, type, sort, showOriginFilter, showTypeFilter]);

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

      const totalMarket = filtered.reduce((sum, p) => sum + (p.marketAvg || 0), 0);
      const totalMy = filtered.reduce((sum, p) => sum + (p.myPrice || 0), 0);
      const totalSave = Math.max(0, totalMarket - totalMy);
      const savePct = totalMarket > 0 ? (totalSave / totalMarket) * 100 : 0;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(
        `Summary: Items ${filtered.length}   |   Total Market: ${formatAED(
          totalMarket
        )}   |   Total MyVegMarket: ${formatAED(totalMy)}   |   Savings: ${formatAED(
          totalSave
        )} (${savePct.toFixed(1)}%)`,
        40,
        78
      );

      const rows = filtered.map((p) => {
        const savePctRow =
          p.marketAvg && p.marketAvg > 0
            ? (((p.marketAvg - p.myPrice) / p.marketAvg) * 100).toFixed(1)
            : "0.0";

        return [
          p.name,
          p.origin,
          p.unit,
          formatAED(p.marketAvg),
          formatAED(p.myPrice),
          `${savePctRow}%`,
        ];
      });

      autoTable(doc, {
        startY: 95,
        head: [["Product", "Origin", "Unit", "Market Rate", "MyVegMarket", "Save"]],
        body: rows,
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [29, 185, 84], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 180 },
          1: { cellWidth: 70 },
          2: { cellWidth: 60 },
          3: { cellWidth: 90 },
          4: { cellWidth: 90 },
          5: { cellWidth: 60 },
        },
      });

     savePdfSmart(doc, `myvegmarket-${cat}-price-report.pdf`);

    } catch (err) {
      console.error(err);
      alert("PDF generation failed. Check console for details.");
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
          {filtered.map((p: Product) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#e0e8e3] shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
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

                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#111713] flex items-center gap-2 shadow-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${p.badgeColor}`} />
                  {p.origin}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold leading-tight mb-1 text-[#111713]">
                    {p.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#648770]">
                    {p.packaging ?? p.subtitle ?? p.unit ?? ""}
                  </p>
                </div>

                <div className="rounded-2xl p-4 mb-5 border border-[#e0e8e3] bg-[#f6f8f7]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-[#6B7C72]">
                        {rateLabel}
                      </div>
                      <div className="mt-1 text-[15px] font-extrabold text-[#111713] tabular-nums">
                        {formatAED(p.marketAvg)}
                      </div>
                    </div>

                    <div className="min-w-0 text-right">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-[#6B7C72]">
                        MyVegMarket
                      </div>
                      <div className="mt-1 text-[15px] font-extrabold text-[#0B5D1E] tabular-nums">
                        {formatAED(p.myPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="my-3 h-px bg-[#e0e8e3]" />

                  <div className="flex items-center justify-between text-[12px] font-semibold text-[#648770]">
                    <span>Unit</span>
                    <span className="text-[#111713]/80">{p.unit}</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-3 items-center">
                  <Link
                    href={`/product/${p.id}`}
                    className="flex-1 bg-[#1db954] text-white font-extrabold text-sm h-11 rounded-full hover:opacity-95 transition-opacity flex items-center justify-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
