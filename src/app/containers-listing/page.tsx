import Link from "next/link";

export default function ContainersListingLandingPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6f8f7] px-4 sm:px-6 lg:px-12 py-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex justify-center">
          <div className="w-full max-w-[820px] bg-white border border-[#e0e8e3] rounded-[34px] px-6 sm:px-10 py-10 shadow-[0_10px_40px_rgba(17,23,19,0.06)]">
            <div className="text-center">
              <div className="text-[11px] tracking-[0.18em] font-extrabold text-[#648770] uppercase">
                Containers Marketplace
              </div>

              <h1 className="mt-3 text-[34px] sm:text-[44px] leading-tight font-black text-[#111713]">
                Choose what you want to do
              </h1>

              <p className="mt-3 text-[#648770] font-medium max-w-[520px] mx-auto leading-relaxed">
                View export-ready containers (subscription required) or list a
                container after exporter verification.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/containers-listing/view"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[220px] px-7 py-3.5 rounded-full bg-[#111713] text-white font-black"
              >
                {/* search icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M21 21l-4.3-4.3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                View Containers
              </Link>

              <Link
                href="/containers-listing/list"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[220px] px-7 py-3.5 rounded-full bg-[#1db954] text-white font-black"
              >
                {/* plus icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                List Container
              </Link>
            </div>

            <div className="mt-6 text-center text-xs font-bold text-[#8aa59a] flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#8aa59a]" />
              EXPORTERS REQUIRE ADMIN APPROVAL.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
