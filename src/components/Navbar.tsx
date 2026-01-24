"use client";

import Link from "next/link";

export default function Navbar() {
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
          MyVegMarket
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-[520px]">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#648770] text-xl">
              search
            </span>
            <input
              className="w-full bg-[#f1f5f3] rounded-full h-12 pl-12 pr-4 focus:ring-2 focus:ring-[#0B5D1E]/30 text-[14px] font-medium placeholder:text-[#648770] outline-none"
              placeholder="Search exotic vegetables, fruits..."
              type="text"
            />
          </div>
        </div>

        {/* Links */}
        <nav className="hidden lg:flex items-center gap-10 font-semibold text-[#111713]">
          <Link href="/products/vegetables" className="hover:text-[#1db954]">
            Market Prices
          </Link>
          <Link href="/bulk-supply" className="hover:text-[#1db954]">
            Bulk Supply
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
            Get Started
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
