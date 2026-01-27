import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#e7efe9] bg-white">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-black text-lg mb-4">
              <span className="w-8 h-8 rounded-full bg-[#0B5D1E] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px]">
                  eco
                </span>
              </span>
              <span className="text-[#0B5D1E]">MyVegmarket</span>
            </div>

            <p className="text-sm text-[#648770] leading-6 max-w-xs">
              Dubai&apos;s trusted sourcing platform for fresh produce. 
              We connect exporters and wholesale suppliers directly to your business with clear daily pricing.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-black text-[#111713] mb-4">
              QUICK LINKS
            </h4>
            <div className="flex flex-col gap-3 text-sm text-[#648770] font-medium">
              <Link href="/" className="hover:text-[#1db954]">
                Market Analysis
              </Link>
              <Link href="/" className="hover:text-[#1db954]">
                Wholesale Tenders
              </Link>
              <Link href="/" className="hover:text-[#1db954]">
                Logistics Partners
              </Link>
              <Link href="/" className="hover:text-[#1db954]">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-[#111713] mb-4">SUPPORT</h4>
            <div className="flex flex-col gap-3 text-sm text-[#648770] font-medium">
              <Link href="/" className="hover:text-[#1db954]">
                Help Center
              </Link>
              <Link href="/" className="hover:text-[#1db954]">
                Quality Standards
              </Link>
              <Link href="/" className="hover:text-[#1db954]">
                Delivery Areas
              </Link>
              <Link href="/" className="hover:text-[#1db954]">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-black text-[#111713] mb-4">
              CONTACT US
            </h4>
            <div className="flex flex-col gap-3 text-sm text-[#648770] font-medium">
              <p>S & Y Global Trading L.L.C</p>
              <p>+971 56 333 7535</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#e7efe9] text-xs text-[#648770] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2024 MyVegmarket Dubai. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <button className="hover:text-[#1db954]">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button className="hover:text-[#1db954]">
              <span className="material-symbols-outlined">language</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
