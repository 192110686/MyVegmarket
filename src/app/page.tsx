"use client";

import CategoryRow from "@/components/CategoryRow";
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
                  Your Veg <br /> Partner in Dubai
                </h1>

                <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                  Get fresh produce with live market prices and reliable delivery across the UAE
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
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#0B5D1E]">
                  Categories
                </h2>
              </div>

              <Link
                href="/products/vegetables"
                className="text-[#1db954] text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4"
              >
                Browse all →
              </Link>
            </div>

            <CategoryRow
              items={[
                {
                  key: "vegetables",
                  title: "Fresh Vegetables",
                  subtitle: "",
                  href: "/products/vegetables",
                  img: "https://source.unsplash.com/1200x900/?vegetables,fresh&sig=21",
                },
                {
                  key: "fruits",
                  title: "Fresh Fruits",
                  subtitle: "",
                  href: "/products/fruits",
                  img: "https://source.unsplash.com/1200x900/?fruits,seasonal&sig=22",
                },
                {
                  key: "spices",
                  title: "Spices",
                  subtitle: "",
                  href: "/products/spices",
                  img: "https://source.unsplash.com/1200x900/?spices,masala&sig=23",
                },
                {
                  key: "nuts",
                  title: "Nuts",
                  subtitle: "",
                  href: "/products/nuts",
                  img: "https://source.unsplash.com/1200x900/?nuts,dryfruits&sig=24",
                },
                {
                  key: "eggs",
                  title: "Fresh Eggs",
                  subtitle: "",
                  href: "/products/eggs",
                  img: "https://source.unsplash.com/1200x900/?eggs,tray&sig=25",
                },
                {
                  key: "oils",
                  title: "Fresh Oils",
                  subtitle: "",
                  href: "/products/oils",
                  img: "https://source.unsplash.com/1200x900/?olive-oil,cooking&sig=26",
                },
              ]}
            />

            <p className="text-[#648770] text-sm font-medium mt-3 px-2">
              Scroll horizontally to explore all categories →
            </p>
          </div>
        </section>

        {/* SERVICES */}
        <section className="px-6 lg:px-20 py-28 bg-[#f8faf9]">
          <div className="max-w-[1440px] mx-auto text-center mb-20">
            <h2 className="text-5xl font-extrabold text-[#0B5D1E] mb-6">
              Our Services
            </h2>
            <p className="text-[#648770] text-lg max-w-2xl mx-auto font-medium">
              Complete support for UAE food businesses — from small cafes to big hotel groups.
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
                backgroundImage: "radial-gradient(circle, #C8A951 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-extrabold text-white mb-6">
                  Ready to source smarter?
                </h2>
                <p className="text-white/80 text-xl font-medium">
                  Join 500+ UAE businesses receiving our daily premium commodity forecast.
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
