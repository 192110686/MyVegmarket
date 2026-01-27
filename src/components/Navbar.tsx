"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/products";

const normalize = (s: string) => s.trim().toLowerCase();

export default function Navbar() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const query = normalize(q);

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    return PRODUCTS.filter((p) => {
      const name = p.name.toLowerCase();
      const origin = p.origin.toLowerCase();
      return name.includes(query) || origin.includes(query);
    }).slice(0, 6);
  }, [query]);

  const go = (text: string) => {
    const t = normalize(text);

    // ✅ keyword -> category route
    if (["fruit", "fruits"].includes(t)) return router.push("/products/fruits");
    if (["vegetable", "vegetables", "veg", "veggies"].includes(t))
      return router.push("/products/vegetables");
    if (["egg", "eggs"].includes(t)) return router.push("/products/eggs");

    // ✅ product match -> product detail
    if (suggestions.length > 0) return router.push(`/product/${suggestions[0].id}`);

    // ✅ fallback
    router.push("/products/vegetables");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-[#e8efe9]">
      <div className="max-w-[1440px] mx-auto px-6 h-[76px] flex items-center justify-between gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 font-black text-xl text-[#0B5D1E]"
        >
          <div className="w-11 h-11 rounded-full bg-[#0B5D1E] flex items-center justify-center text-white">
            <span className="material-symbols-outlined">eco</span>
          </div>
          MyVegmarket
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-[520px] relative">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#648770] text-xl">
              search
            </span>

            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  go(q);
                  setOpen(false);
                }
                if (e.key === "Escape") setOpen(false);
              }}
              className="w-full bg-[#f1f5f3] rounded-full h-12 pl-12 pr-4 focus:ring-2 focus:ring-[#0B5D1E]/30 text-[14px] font-medium placeholder:text-[#648770] outline-none"
              placeholder='Search "fruit", "apple", "tomato"...'
              type="text"
            />

            {/* ✅ Suggestions dropdown */}
            {open && query.length >= 2 && (
              <div className="absolute top-[52px] left-0 right-0 bg-white border border-[#e8efe9] rounded-2xl shadow-lg overflow-hidden z-50">
                {suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-[#648770]">
                    No matches. Try: <b>fruit</b>, <b>vegetables</b>, <b>eggs</b>, <b>apple</b>…
                  </div>
                ) : (
                  <div className="max-h-[320px] overflow-auto">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-[#f1f5f3] flex items-center gap-3"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => router.push(`/product/${p.id}`)}
                      >
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-[#f1f5f3] flex-shrink-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#111713] truncate">
                            {p.name}
                          </div>
                          <div className="text-xs text-[#648770] truncate">
                            {p.category.toUpperCase()} • {p.origin} • {p.unit}
                          </div>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-[#f1f5f3] text-sm font-semibold text-[#0B5D1E]"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => go(q)}
                    >
                      Search “{q}” →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <nav className="hidden lg:flex items-center gap-10 font-semibold text-[#111713]">
          <Link href="/products/vegetables" className="hover:text-[#1db954]">
            AL Aweer Prices
          </Link>
          <Link href="/bulk-supply" className="hover:text-[#1db954]">
            Get Started
          </Link>
          <Link href="/services" className="hover:text-[#1db954]">
            Services
          </Link>
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/get-started"
            className="h-11 px-6 rounded-full bg-[#1db954] text-white font-bold flex items-center justify-center hover:opacity-90"
          >
            Containers Listing
          </Link>

          <Link
            href="/login"
            className="h-11 px-6 rounded-full bg-[#f0f4f2] text-[#111713] font-bold flex items-center justify-center hover:bg-[#e6efe9]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
