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

  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  // ✅ close suggestion dropdown when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []); // ✅ constant deps

  // ✅ close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileMenu(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []); // ✅ constant deps

  // ✅ ESC closes menu (premium behavior)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // ✅ constant deps

  // ✅ prevent body scroll ONLY when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]); // ✅ constant deps length (always 1)

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

      {!hideDropdown && open && query.length >= 2 && (
        <div className="absolute top-[54px] left-0 right-0 bg-white border border-[#e8efe9] rounded-2xl shadow-xl overflow-hidden z-50">
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
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
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
        <div className="h-[76px] flex items-center gap-3">
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

          {/* Right side (always pinned right) */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Desktop links (includes Containers now as NORMAL link) */}
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
              <Link href="/containers-listing" className="hover:text-[#1db954]">
                Containers Listing
              </Link>
            </nav>

            {/* Login (desktop + tablet) */}
            <Link
  href="/login"
  className="hidden lg:flex h-11 px-5 rounded-full bg-[#f0f4f2] text-[#111713] font-bold items-center justify-center hover:bg-[#e6efe9] whitespace-nowrap"
>
  Login
</Link>


            {/* ✅ Hamburger: small SQUARE box top-right (works for iphone + android) */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenu((v) => !v)}
              className="lg:hidden h-11 w-11 rounded-xl border border-[#e8efe9] bg-white grid place-items-center shadow-sm hover:shadow-md transition flex-shrink-0"
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

      {/* ✅ Mobile/Tablet Menu: small dropdown box at TOP-RIGHT */}
      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* click outside closes */}
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileMenu(false)} />

          {/* dropdown panel */}
          <div className="fixed top-[86px] right-4 sm:right-6">
            <div className="w-[min(92vw,320px)] bg-white rounded-2xl shadow-xl border border-[#e8efe9] overflow-hidden">
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

              {/* ✅ Containers moved INSIDE hamburger menu (as you asked) */}
              <button
                type="button"
                className="w-full text-left px-5 py-4 font-semibold hover:bg-[#f1f5f3]"
                onClick={() => {
                  setMobileMenu(false);
                  router.push("/containers-listing");
                }}
              >
                Containers Listing
              </button>

              {/* Login visible on mobile too */}
              <button
                type="button"
                className="w-full text-left px-5 py-4 font-bold text-[#0B5D1E] hover:bg-[#f1f5f3]"
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
