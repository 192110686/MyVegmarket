"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white text-[#111713] antialiased">
      <main>
        {/* HERO */}
        <section className="px-6 lg:px-12 py-8">
          <div className="max-w-[1440px] mx-auto">
            <div
              className="relative overflow-hidden min-h-[640px] flex items-center justify-center bg-cover bg-center text-center p-12 rounded-[4rem]"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC_wduGMsWWK2Cs9zmK44CJUyITM2jUadlmqvIxxLN5vVs3iv1LB2iI2rxlUmvooWzNdDWsdrA3Vo6kLROi-nf1C7Un9dedtvgWahFScIZFx1L89pnmuY9y4eSV39afm6CsGz5oJohxOxTlkAGFkqVg_U7Wp4KbeFIBx4rwGDggf__xrXSeaTaoURJ32zR2FLeorIN3WCiTjmbOAivHATMlByyF9UpR67x8wkwjhjx7TaN-IhVbQoyWZ_dSkEJoD3mQJKTpnRMoG5Y")`,
              }}
            >
              <div className="max-w-4xl flex flex-col items-center gap-8">
                <span className="bg-[#C8A951] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                  Dubai&apos;s Premium Sourcing Platform
                </span>

                <h1 className="text-white text-6xl md:text-8xl font-extrabold leading-[1.05] tracking-tight">
                  Your Market Price <br /> Partner in Dubai
                </h1>

                <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                  Experience the pinnacle of fresh produce sourcing with real-time
                  market insights and premium delivery services across the UAE.
                </p>

                <div className="flex flex-wrap gap-4 mt-4">
                  <Link
                    href="/products/vegetables"
                    className="bg-[#1db954] text-white text-sm font-bold h-12 px-8 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                  >
                    📈 View Live Prices
                  </Link>

                  <Link
                    href="/bulk-supply"
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold h-12 px-8 rounded-full hover:bg-white/20 transition-all flex items-center justify-center"
                  >
                    Get Bulk Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="px-6 lg:px-20 py-24">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex justify-between items-end mb-12 px-2">
              <div>
                <p className="text-[#C8A951] font-bold text-xs uppercase tracking-[0.2em] mb-3">
                  The Selection
                </p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#0B5D1E]">
                  Premium Categories
                </h2>
              </div>

              <Link
                href="/products/vegetables"
                className="text-[#1db954] text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4"
              >
                Browse all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Vegetables */}
              <Link
                href="/products/vegetables"
                className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] cursor-pointer"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB_OfbvfFp9pAdXaCsJa_HSgdfwv6Yk2_QgXz2HQsZP-yFKZoZsUiiaYA4SfbUDT4O9ShNaogMesM6OpFINJEPeTHIjoBM7QQg8Lgjd8XxTNvf1-FDnnnzWQ0Mc7kB8LdT7K4_hmh3U9UK9Zvfy8DE8o1rKcMVTeeclS2Zo_SziycVUYUkdG3L5FYhrnL8vPY3MrY17ITkQBPKTqVlAUiKkVwEbwJy7ACVppzH59PyIUzv-sJkQzLZvYnb7xIDfMNBs72YwkHV5zQ"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Exotic Vegetables"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#C8A951] transition-all duration-500 rounded-[2.5rem]" />
                <div className="absolute bottom-10 left-10 right-10">
                  <h3 className="text-white text-2xl font-bold mb-2">
                    Exotic Vegetables
                  </h3>
                  <p className="text-white/75 text-sm font-medium">
                    Directly from alpine farms & local hydroponics
                  </p>
                </div>
              </Link>

              {/* Fruits */}
              <Link
                href="/products/fruits"
                className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] cursor-pointer bg-[#0B5D1E]"
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 45%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBPUMFIjtU7fCPlsusZCAIIr_f67ibJUuRHi0QoA1qkbXaBlCNMM6pLFmKvxW9i-tbhocVcOroEMEc6r1nZoofA6t5H4SVitr44zG3EX-9bC1xRi9xPhqmUmlk-ngSgRBCeFvW9CQJnlOa34ea5meDqVu6wQHdKg9X2T6yw8BJTmTUu4TtX4ML487rZGN-HP0690G-GpNdk8_6B_IIue0o5NZu7XfuKV6gieZfk6Agkqg-GWJXrv7AbRdQZf1TyU2tFGQANvRIiFDo")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#C8A951] transition-all duration-500 rounded-[2.5rem]" />
                <div className="absolute bottom-10 left-10 right-10">
                  <h3 className="text-white text-2xl font-bold mb-2">
                    Seasonal Fruits
                  </h3>
                  <p className="text-white/70 text-sm font-medium">
                    Global imports of premium varieties
                  </p>
                </div>
              </Link>

              {/* Eggs */}
              <Link
                href="/products/eggs"
                className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] cursor-pointer bg-[#0B5D1E]"
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 45%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuByVD4oF7U_G2CG-HodQNx9_fRsLpxd2QbInKsQIKTL1MLcY4NmtXb2ix1_NIVxM_uebS_YKyTV-nMgiWNItMCm1i9uJMWBpkswjIUkiwhyXph8SrF92vuERfZWhmjpRsLX-xXW19r4_WGckkydgnWpQPL2RDFTvAgzgHRue6WKgx5u9-tsDgO8IhECg-ONtLw4KOf_304Dx-_5ZT42jM3Va6DIFh2T16x1DwbkzOHqqbee5TTVEDUIr88VZ0B4a3ywB60V66RE0XY")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#C8A951] transition-all duration-500 rounded-[2.5rem]" />
                <div className="absolute bottom-10 left-10 right-10">
                  <h3 className="text-white text-2xl font-bold mb-2">
                    Farm Fresh Eggs
                  </h3>
                  <p className="text-white/70 text-sm font-medium">
                    Organic, free-range local harvests
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="px-6 lg:px-20 py-28 bg-[#f8faf9]">
          <div className="max-w-[1440px] mx-auto text-center mb-20">
            <h2 className="text-5xl font-extrabold text-[#0B5D1E] mb-6">
              Our Professional Services
            </h2>
            <p className="text-[#648770] text-lg max-w-2xl mx-auto font-medium">
              The ultimate infrastructure for UAE’s F&B sector, from boutique cafes
              to hospitality groups.
            </p>

            <Link
              href="/services"
              className="inline-flex mt-8 bg-[#1db954] text-white text-sm font-bold h-12 px-10 rounded-full items-center justify-center hover:opacity-90"
            >
              View Services
            </Link>
          </div>
        </section>

        {/* CTA SUBSCRIBE */}
        <section className="px-6 lg:px-20 py-24">
          <div className="max-w-[1440px] mx-auto bg-[#0B5D1E] rounded-[3rem] p-16 relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #C8A951 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-extrabold text-white mb-6">
                  Ready to source smarter?
                </h2>
                <p className="text-white/80 text-xl font-medium">
                  Join 500+ UAE businesses receiving our daily premium commodity
                  forecast.
                </p>
              </div>

              <div className="flex w-full md:w-auto gap-4 bg-[#144921] p-2 rounded-full border border-white/10">
                <input
                  className="bg-transparent border-none text-white placeholder:text-white/40 rounded-full h-12 px-6 md:w-72 focus:ring-0 outline-none"
                  placeholder="Enter business email"
                  type="email"
                />
                <button className="bg-[#c4a654] text-[#0b1a0e] font-extrabold h-12 px-10 rounded-full hover:bg-white transition-all whitespace-nowrap text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
