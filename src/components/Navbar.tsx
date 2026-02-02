"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/products";

const normalize = (s: string) => s.trim().toLowerCase();

export default function Navbar() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

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

    if (["fruit", "fruits"].includes(t)) return router.push("/products/fruits");
    if (["vegetable", "vegetables", "veg", "veggies"].includes(t))
      return router.push("/products/vegetables");
    if (["egg", "eggs"].includes(t)) return router.push("/products/eggs");

    if (suggestions.length > 0) return router.push(`/product/${suggestions[0].id}`);

    router.push("/products/vegetables");
  };

  // close suggestion dropdown when clicking outside
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileMenu(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ Premium: prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  const SearchBox = ({ hideDropdown = false }: { hideDropdown?: boolean }) => (
    <div ref={searchWrapRef} className="relative w-full min-w-0">
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

      {/* Suggestions */}
      {!hideDropdown && open && query.length >= 2 && (
        <div
          className="
            absolute top-[54px] left-0 right-0
            bg-white border border-[#e8efe9] rounded-2xl shadow-xl overflow-hidden z-50
          "
        >
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
                  onClick={() => {
                    router.push(`/product/${p.id}`);
                    setOpen(false);
                  }}
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
                    <div className="font-semibold text-[#111713] truncate">{p.name}</div>
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
                onClick={() => {
                  go(q);
                  setOpen(false);
                }}
              >
                Search “{q}” →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-[#e8efe9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Row 1 */}
        <div className="h-[76px] flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 font-black text-lg sm:text-xl text-[#0B5D1E] shrink-0"
          >
            <div className="w-11 h-11 rounded-full bg-[#0B5D1E] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined">eco</span>
            </div>
            MyVegmarket
          </Link>

          {/* Search inline for md+ */}
          <div className="hidden md:flex flex-1 min-w-0 px-3">
            <div className="w-full max-w-[620px] min-w-0">
              <SearchBox />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop links */}
            <nav className="hidden lg:flex items-center gap-8 font-semibold text-[#111713]">
              <Link href="/al-aweer-prices" className="hover:text-[#1db954]">
                Al Aweer Prices
              </Link>
              <Link href="/bulk-supply" className="hover:text-[#1db954]">
                Get Started
              </Link>
              <Link href="/services" className="hover:text-[#1db954]">
                Services
              </Link>
            </nav>

            {/* Containers */}
            <Link
              href="/containers-listing"
              className="h-11 px-4 sm:px-6 rounded-full bg-[#1db954] text-white font-bold flex items-center justify-center hover:opacity-90 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Containers Listing</span>
              <span className="sm:hidden">Containers</span>
            </Link>

            {/* Login for >=sm */}
            <Link
              href="/login"
              className="hidden sm:flex h-11 px-5 rounded-full bg-[#f0f4f2] text-[#111713] font-bold items-center justify-center hover:bg-[#e6efe9]"
            >
              Login
            </Link>

            {/* Menu (mobile+tablet) */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenu((v) => !v)}
              className="lg:hidden h-11 w-11 rounded-full border border-[#e8efe9] bg-white grid place-items-center"
            >
              <span className="material-symbols-outlined text-[#111713]">
                {mobileMenu ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: mobile search */}
        <div className="md:hidden pb-4">
          <SearchBox hideDropdown={false} />
        </div>
      </div>

      {/* ✅ Mobile menu overlay (premium, no layout shift) */}
      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenu(false)}
          />

          <div className="absolute top-[76px] left-0 right-0 px-4 sm:px-6">
            <div className="bg-white rounded-2xl shadow-xl border border-[#e8efe9] overflow-hidden">
              <button
                type="button"
                className="w-full text-left px-5 py-4 font-semibold hover:bg-[#f1f5f3]"
                onClick={() => {
                  setMobileMenu(false);
                  router.push("/al-aweer-prices");
                }}
              >
                Al Aweer Prices
              </button>
              <button
                type="button"
                className="w-full text-left px-5 py-4 font-semibold hover:bg-[#f1f5f3]"
                onClick={() => {
                  setMobileMenu(false);
                  router.push("/bulk-supply");
                }}
              >
                Get Started
              </button>
              <button
                type="button"
                className="w-full text-left px-5 py-4 font-semibold hover:bg-[#f1f5f3]"
                onClick={() => {
                  setMobileMenu(false);
                  router.push("/services");
                }}
              >
                Services
              </button>

              {/* Login for xs (since top login is hidden on xs) */}
              <button
                type="button"
                className="sm:hidden w-full text-left px-5 py-4 font-bold text-[#0B5D1E] hover:bg-[#f1f5f3]"
                onClick={() => {
                  setMobileMenu(false);
                  router.push("/login");
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
