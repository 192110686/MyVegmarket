import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function AlAweerPricesPage() {
  // Group products by category
  const grouped: Record<string, typeof PRODUCTS> = PRODUCTS.reduce((acc: any, p: any) => {
    const cat = (p.category || "others").toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  // Sort categories + products
  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  categories.forEach((cat) => {
    grouped[cat].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  });

  // Summary (ONLY market total)
  const summary = PRODUCTS.reduce(
    (s, p) => {
      s.items += 1;
      s.totalMarket += Number(p.marketAvg || 0);
      return s;
    },
    { items: 0, totalMarket: 0 }
  );

  const generatedAt = new Date().toLocaleString();

  return (
    <div className="bg-white text-[#111713] min-h-screen">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">MyVegMarket - Al Aweer Price Report</h1>
            <p className="text-sm text-gray-600 mt-2">Generated: {generatedAt}</p>

            <p className="text-sm text-gray-700 mt-2">
              <b>Summary:</b> Items {summary.items} &nbsp; | &nbsp; Total Market:{" "}
              <b>AED {summary.totalMarket.toFixed(2)}</b>
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/" className="px-4 py-2 rounded-full border hover:bg-gray-50">
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="max-w-6xl mx-auto px-6 pb-16 space-y-12">
        {categories.map((cat) => (
          <section key={cat}>
            {/* Category title */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold capitalize">{cat}</h2>
              <span className="text-sm text-gray-500">{grouped[cat].length} items</span>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-12 gap-0 bg-green-600 text-white text-sm font-semibold">
              <div className="col-span-5 px-4 py-3">Product</div>
              <div className="col-span-3 px-4 py-3">Origin</div>
              <div className="col-span-2 px-4 py-3">Unit</div>
              <div className="col-span-2 px-4 py-3 text-right">Market Rate</div>
            </div>

            {/* Rows (flat, alternating) */}
            <div>
              {grouped[cat].map((p: any, idx: number) => (
                <div
                  key={p.id}
                  className={`grid grid-cols-12 gap-0 text-sm ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="col-span-5 px-4 py-3">{p.name}</div>
                  <div className="col-span-3 px-4 py-3 text-gray-700">{p.origin || "—"}</div>
                  <div className="col-span-2 px-4 py-3 text-gray-700">{p.unit || "—"}</div>
                  <div className="col-span-2 px-4 py-3 text-right">
                    {typeof p.marketAvg === "number" ? `AED ${p.marketAvg.toFixed(2)}` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
