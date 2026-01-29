"use client";

import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { useMemo, useState } from "react";
import PriceTrendModal from "@/components/PriceTrendModal";

function safeImg(url: string) {
  return (
    url ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
  );
}

export default function ProductDetailClient({ id }: { id: string }) {
  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);

  const [range, setRange] = useState<"7D" | "30D" | "90D">("7D");
  const [openTrend, setOpenTrend] = useState(false);

  const title = product?.name ?? id;
  const origin = product?.origin ?? "UAE";
  const type = product?.type ?? "Regular";
  const unit = product?.unit ?? "KG";
  const myPrice = product?.myPrice ?? 12.25;
  const marketAvg = product?.marketAvg ?? 15.5;

  const thumbs = [
    product?.image,
    "https://images.unsplash.com/photo-1546470427-e26264be0b95?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=800&q=80",
  ].map((x) => safeImg(x || ""));

  return (
    <main className="bg-[#f6f8f7] min-h-screen px-6 lg:px-20 pt-10 pb-24">
      <div className="max-w-[1300px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#648770] mb-6 font-medium">
          <Link className="hover:text-[#1db954]" href="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <Link className="hover:text-[#1db954]" href="/products/vegetables">
            Products
          </Link>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <span className="text-[#111713] font-bold">{title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative rounded-[28px] overflow-hidden border border-[#e0e8e3] shadow-sm bg-white">
              <div className="absolute top-4 left-4 z-10 bg-[#1db954] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                Top Quality
              </div>

              <div className="aspect-square w-full bg-[#f0f4f2]">
                <img
                  src={safeImg(product?.image || thumbs[0])}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";
                  }}
                />
              </div>
            </div>

            {/* Thumbs */}
            <div className="flex gap-3">
              {thumbs.slice(0, 4).map((t, idx) => (
                <button
                  key={idx}
                  className={`w-[76px] h-[76px] rounded-2xl overflow-hidden border bg-white shadow-sm ${
                    idx === 0
                      ? "border-[#1db954] ring-2 ring-[#1db954]/15"
                      : "border-[#e0e8e3]"
                  }`}
                >
                  <img
                    src={t}
                    alt="thumb"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#1db954]/10 text-[#1db954] text-[11px] font-black uppercase tracking-tight">
                Verified Supplier
              </span>
              <span className="text-sm text-[#648770] font-medium">
                SKU: MV-{id}
              </span>
            </div>

            <h1 className="text-[52px] leading-[1.05] font-black text-[#111713]">
              {title}
            </h1>

            <p className="text-[#648770] mt-3 flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-base">
                location_on
              </span>
              Origin: {origin} • {type} • {unit}
            </p>

            {/* Price Analysis (UPDATED: neutral, no strike-through, no promo) */}
            <div className="mt-7 bg-white border border-[#e0e8e3] p-6 rounded-[28px] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black flex items-center gap-2 text-lg text-[#111713]">
                  <span className="material-symbols-outlined text-[#1db954]">
                    analytics
                  </span>
                  Price Analysis
                </h3>

                <div className="flex bg-[#f0f4f2] p-1 rounded-full">
                  {(["7D", "30D", "90D"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-4 py-1.5 text-xs font-black rounded-full transition-all ${
                        range === r
                          ? "bg-white shadow-sm text-[#111713]"
                          : "text-[#648770]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Left: prices */}
                <div className="rounded-2xl border border-[#e0e8e3] bg-[#fbfcfb] p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white border border-[#e0e8e3] p-4">
                      <div className="text-[11px] font-black uppercase tracking-wider text-[#648770] mb-1">
                        Market Average
                      </div>
                      <div className="text-2xl font-black text-[#111713]">
                        AED {marketAvg.toFixed(2)}
                      </div>
                      <div className="text-xs text-[#648770] font-medium mt-1">
                        Reference only
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white border border-[#1db954]/25 p-4">
                      <div className="text-[11px] font-black uppercase tracking-wider text-[#648770] mb-1">
                        MyVegMarket Price
                      </div>
                      <div className="text-2xl font-black text-[#1db954]">
                        AED {myPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-[#648770] font-medium mt-1">
                        Today’s listed price
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {(() => {
                      const diff = marketAvg - myPrice;
                      const pct = marketAvg ? (diff / marketAvg) * 100 : 0;
                      const isLower = diff > 0;

                      return (
                        <>
                          <span className="text-xs font-black uppercase tracking-wider text-[#648770]">
                            Difference
                          </span>

                          <span
                            className={[
                              "text-xs font-black px-3 py-2 rounded-full border",
                              isLower
                                ? "bg-[#1db954]/10 text-[#1db954] border-[#1db954]/20"
                                : "bg-[#111713]/5 text-[#111713] border-black/10",
                            ].join(" ")}
                          >
                            AED {Math.abs(diff).toFixed(2)} (
                            {Math.abs(pct).toFixed(1)}%)
                          </span>

                          <span className="text-xs text-[#648770] font-medium">
                            {isLower
                              ? "MyVegMarket is lower than market average"
                              : "MyVegMarket is higher than market average"}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Right: trend preview */}
                <button
                  type="button"
                  onClick={() => setOpenTrend(true)}
                  className="rounded-2xl bg-[#f6f8f7] border border-[#e0e8e3] p-5 flex flex-col justify-between text-left hover:shadow-md hover:shadow-black/5 transition"
                  title="Click to view full trend"
                >
                  <div>
                    <div className="text-[11px] uppercase tracking-widest font-black text-[#111713]/45">
                      PRICE TREND
                    </div>
                    <div className="text-sm text-[#648770] font-medium mt-1">
                      View interactive chart & compare market vs MyVegMarket
                    </div>
                  </div>

                  <div className="mt-3 relative h-[90px] rounded-xl bg-white border border-[#e0e8e3] overflow-hidden">
                    <svg viewBox="0 0 220 100" className="w-full h-full">
                      <path
                        d="M0,70 C35,35 70,85 110,55 C140,30 170,50 220,18"
                        fill="none"
                        stroke="#1db954"
                        strokeWidth="3"
                      />
                      <path
                        d="M0,78 C35,55 70,90 110,68 C140,55 170,75 220,55"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        opacity="0.55"
                      />
                    </svg>

                    <span className="absolute bottom-2 right-2 text-[10px] font-black text-[#111713] bg-white/80 border border-black/10 px-2 py-1 rounded-full">
                      VIEW
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Chips */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#e0e8e3] rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#648770] mb-1">
                  Type
                </p>
                <p className="font-black text-[#111713]">{type}</p>
              </div>

              <div className="bg-white border border-[#e0e8e3] rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#648770] mb-1">
                  Packaging
                </p>
                <p className="font-black text-[#111713]">
                  {product?.packaging ?? "Standard Packing"}
                </p>
              </div>

              <div className="bg-white border border-[#e0e8e3] rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#648770] mb-1">
                  Freshness
                </p>
                <p className="font-black text-[#111713]">
                  {product?.freshness ?? "Harvested Today"}
                </p>
              </div>
            </div>

            {/* About */}
            <div className="mt-6">
              <h3 className="text-xl font-black text-[#111713] mb-2">
                About the Produce
              </h3>
              <p className="text-[#648770] font-medium leading-7 max-w-2xl">
                {product?.about ??
                  "Premium quality produce sourced from verified partners. Consistent grading and reliable delivery for B2B customers."}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-[#1db954] text-white font-black py-4 rounded-full flex items-center justify-center gap-3 shadow-lg shadow-[#1db954]/20 hover:scale-[1.01] transition-transform active:scale-95">
                <span className="material-symbols-outlined">chat</span>
                WhatsApp Order
              </button>

              <button className="flex-1 bg-white border border-[#1db954] text-[#1db954] font-black py-4 rounded-full flex items-center justify-center gap-3 hover:bg-[#1db954]/5 transition-colors">
                <span className="material-symbols-outlined">call</span>
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Pricing */}
        <section className="mt-16 p-8 rounded-[30px] bg-[#edf4ef] border border-[#1db954]/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black mb-2 text-[#111713]">
                Bulk Purchase Options
              </h2>
              <p className="text-[#648770] font-medium">
                Are you a restaurant or hotel? Get tiered pricing for orders
                above 50kg.
              </p>
            </div>

            <button className="bg-[#111713] text-white font-black px-8 py-3 rounded-full flex items-center gap-2 hover:opacity-90">
              <span className="material-symbols-outlined">request_quote</span>
              Request Quote
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4">
              <p className="text-xs text-[#648770] font-black uppercase">
                10 - 50 KG
              </p>
              <p className="text-lg font-black text-[#1db954]">AED 11.50</p>
            </div>

            <div className="text-center p-4 border-l border-[#d7e3dc]">
              <p className="text-xs text-[#648770] font-black uppercase">
                50 - 200 KG
              </p>
              <p className="text-lg font-black text-[#1db954]">AED 10.75</p>
            </div>

            <div className="text-center p-4 border-l border-[#d7e3dc]">
              <p className="text-xs text-[#648770] font-black uppercase">
                200 - 500 KG
              </p>
              <p className="text-lg font-black text-[#1db954]">AED 10.00</p>
            </div>

            <div className="text-center p-4 border-l border-[#d7e3dc]">
              <p className="text-xs text-[#648770] font-black uppercase">
                500+ KG
              </p>
              <p className="text-lg font-black text-[#1db954]">Custom</p>
            </div>
          </div>
        </section>
      </div>

      {/* Full chart modal */}
      <PriceTrendModal
        open={openTrend}
        onClose={() => setOpenTrend(false)}
        productId={id}
        productName={title}
      />
    </main>
  );
}
