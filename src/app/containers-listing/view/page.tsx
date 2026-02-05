"use client";

import Link from "next/link";

export default function ViewContainersLockedPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6f8f7] px-4 sm:px-6 lg:px-12 py-10">
      <div className="max-w-[1100px] mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/containers-listing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#648770] hover:text-[#1db954] transition"
          >
            <span className="text-base">←</span>
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col gap-10">
          {/* LOCKED HERO CARD */}
          <section className="bg-white border border-[#e0e8e3] rounded-[32px] px-6 sm:px-10 py-10 shadow-[0_8px_30px_rgba(17,23,19,0.06)]">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#eaf7ef] flex items-center justify-center">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="text-[#1db954]">
                  <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path
                    d="M6.5 10h11A1.5 1.5 0 0 1 19 11.5v8A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="max-w-[560px] text-center">
                <h1 className="text-3xl sm:text-4xl font-black text-[#111713]">
                  Subscription Required
                </h1>
                <p className="mt-3 text-[#648770] font-medium leading-relaxed">
                  Unlock exclusive global container trade data, direct exporter contacts, and real-time inventory listings.
                  Login with mobile OTP and subscribe to unlock container cards.
                </p>
              </div>

              <div className="w-full max-w-[520px] flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/containers-listing/login"
                  className="flex-1 inline-flex items-center justify-center rounded-full h-12 px-6 bg-[#eef2f0] text-[#111713] font-black hover:bg-[#e7ecea] transition"
                >
                  Login (Mobile OTP)
                </Link>

                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center rounded-full h-12 px-6 bg-[#1db954] text-white font-black shadow-[0_10px_25px_rgba(29,185,84,0.25)] hover:brightness-110 transition"
                  onClick={() => alert("Razorpay subscription will be added later ✅")}
                >
                  Subscribe &amp; Unlock
                </button>
              </div>
            </div>
          </section>

          {/* PRICING HEADER */}
          <div className="text-center">
            <div className="text-[#1db954] text-xs sm:text-sm font-black uppercase tracking-[0.22em]">
              Unlock Premium Access
            </div>
            <div className="mt-2 text-sm font-medium text-[#8aa59a]">
              Choose the best plan for your logistics needs
            </div>
          </div>

          {/* PRICING CARD */}
          <section className="flex justify-center">
            <div className="w-full max-w-[520px] bg-white border border-[#e0e8e3] rounded-[28px] p-8 shadow-[0_8px_30px_rgba(17,23,19,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-black text-[#111713]">Premium Access</div>
                <div className="px-3 py-1 rounded-full bg-[#1db954] text-white text-[11px] font-black uppercase tracking-[0.08em]">
                  Recommended
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-black text-[#111713]">Custom</div>
                  <div className="text-sm font-black text-[#8aa59a]">/ month</div>
                </div>
                <div className="mt-1 text-xs font-semibold text-[#8aa59a]">
                  Starting at competitive market rates
                </div>
              </div>

              <div className="my-6 h-px bg-[#eef2f0]" />

              <ul className="space-y-4">
                <Feature text="Access to all global listings" />
                <Feature text="Daily inventory updates" />
                <Feature text="Dedicated WhatsApp support" />
                <Feature text="Priority inspection reports" />
              </ul>

              <button
                type="button"
                className="mt-6 w-full h-12 rounded-full border-2 border-[#1db954] text-[#1db954] font-black hover:bg-[#1db954] hover:text-white transition"
                onClick={() => alert("Get Started will open Razorpay later ✅")}
              >
                Get Started
              </button>
            </div>
          </section>

          <div className="text-center text-xs font-semibold text-[#a7b7af]">
            Secure payment processing via Razorpay. No hidden fees. Cancel anytime.
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm font-semibold text-[#3b5b4a]">
      <span className="inline-flex w-6 h-6 rounded-full bg-[#eaf7ef] items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#1db954]">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {text}
    </li>
  );
}
