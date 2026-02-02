"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/products";

const normalize = (s: string) => s.trim().toLowerCase();

function useDebouncedValue<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Navbar() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // ✅ debounce only for suggestions (typing stays instant)
  const debouncedQ = useDebouncedValue(q, 200);
  const query = normalize(debouncedQ);

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

  const desktopSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);

  // ✅ close dropdown when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node;

      const insideDesktop =
        desktopSearchRef.current && desktopSearchRef.current.contains(target);
      const insideMobile =
        mobileSearchRef.current && mobileSearchRef.current.contains(target);

      if (!insideDesktop && !insideMobile) setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("pointerdown", onDown);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  // ✅ close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileMenu(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ ESC closes dropdown + menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileMenu(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  const SearchBox = ({
    wrapRef,
    hideDropdown = false,
  }: {
    wrapRef: React.RefObject<HTMLDivElement | null>;
    hideDropdown?: boolean;
  }) => {
    return (
      <div ref={wrapRef} className="relative w-full min-w-0">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#648770] text-xl">
          search
        </span>

        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value); // ✅ typing only updates q (no dropdown state spam)
          }}
          onFocus={() => setOpen(true)} // ✅ open dropdown only on focus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              go(q);
              setOpen(false);
              (e.currentTarget as HTMLInputElement).blur();
            }
            if (e.key === "Escape") setOpen(false);
          }}
          className="w-full bg-white border border-[#e8efe9] rounded-full h-12 pl-12 pr-4
                     focus:ring-2 focus:ring-[#0B5D1E]/30 text-base font-semibold
                     text-[#111713] placeholder:text-[#648770] outline-none"
          placeholder='Search "fruit", "apple", "tomato"...'
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          style={{ colorScheme: "light" }}
        />

        {/* ✅ dropdown uses debounced query so it doesn’t lag typing */}
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
                    // ✅ pointerdown is NOT passive -> no warning + smooth selection
                    onPointerDown={(e) => e.preventDefault()}
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
                  onPointerDown={(e) => e.preventDefault()}
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
  };

  return (
    // ✅ IMPORTANT: remove backdrop blur on mobile (fixes Chrome mobile input focus issues)
    <header className="fixed top-0 left-0 right-0 z-50 bg-white md:bg-white/95 md:backdrop-blur border-b border-[#e8efe9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
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

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 min-w-0 px-3">
            <div className="w-full max-w-[620px] min-w-0">
              <SearchBox wrapRef={desktopSearchRef} />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
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

            <Link
              href="/login"
              className="hidden lg:flex h-11 px-5 rounded-full bg-[#f0f4f2] text-[#111713] font-bold items-center justify-center hover:bg-[#e6efe9] whitespace-nowrap"
            >
              Login
            </Link>

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

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <SearchBox wrapRef={mobileSearchRef} />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileMenu(false)} />

          <div className="fixed top-[86px] right-4 sm:right-6">
            <div className="w-[min(92vw,320px)] bg-white text-[#111713] rounded-2xl shadow-xl border border-[#e8efe9] overflow-hidden">
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
