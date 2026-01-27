import Link from "next/link";

export default function BulkSupplyPage() {
  const features = [
    {
      title: "Wholesale Procurement",
      desc: "Daily sourcing directly from trusted suppliers.",
      icon: "inventory_2",
    },
    {
      title: "Reliable Logistics",
      desc: "Planned delivery with freshness protection across Dubai.",
      icon: "local_shipping",
    },
    {
      title: "Quality Assurance",
      desc: "Sorting, grading, packing, and quick replacements if needed.",
      icon: "verified",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Send Requirement",
      icon: "edit_note",
      desc: "Share items, quantity, and delivery date.",
    },
    {
      step: "02",
      title: "We Quote & Confirm",
      icon: "request_quote",
      desc: "We send the best rate and confirm fast.",
    },
    {
      step: "03",
      title: "Sourcing & QC",
      icon: "fact_check",
      desc: "We source fresh stock and check quality.",
    },
    {
      step: "04",
      title: "Delivery & Support",
      icon: "support_agent",
      desc: "We deliver and stay available for support.",
    },
  ];

  return (
    <main className="bg-[#f6f8f7] min-h-screen px-6 lg:px-20 pt-10 pb-24">
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#648770] mb-6 font-medium">
          <Link className="hover:text-[#1db954]" href="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <span className="text-[#111713] font-bold">Bulk Supply</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black tracking-tight text-[#111713]">
              Bulk Supply & Sourcing
            </h1>
            <p className="text-lg text-[#648770] font-medium mt-3 leading-8">
              Reliable bulk sourcing with quality checks and delivery across
              Dubai.
            </p>
          </div>

          <Link
            href="/get-started"
            className="h-12 px-7 rounded-full bg-[#1db954] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[#1db954]/20"
          >
            <span className="material-symbols-outlined">rocket_launch</span>
            Request Bulk Quote
          </Link>
        </div>

        {/* 3 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {features.map((x) => (
            <div
              key={x.title}
              className="bg-white rounded-3xl border border-[#e0e8e3] shadow-sm p-7"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1db954]/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#1db954]">
                  {x.icon}
                </span>
              </div>
              <h3 className="text-xl font-black text-[#111713]">{x.title}</h3>
              <p className="text-[#648770] font-medium mt-2 leading-7">
                {x.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Process */}
        <div className="bg-white border border-[#e0e8e3] rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-black text-[#111713] mb-2">
            How Bulk Supply Works
          </h2>
          <p className="text-[#648770] font-medium mb-8">
            Simple 4-step process for restaurants, hotels & retailers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl bg-[#f0f4f2] border border-[#e0e8e3] p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-black text-[#1db954]">
                    {s.step}
                  </span>
                  <span className="material-symbols-outlined text-[#648770]">
                    {s.icon}
                  </span>
                </div>
                <p className="text-lg font-black text-[#111713]">{s.title}</p>
                <p className="text-[#648770] font-medium mt-2 text-sm leading-6">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-started"
              className="flex-1 h-12 rounded-full bg-[#0B5D1E] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90"
            >
              <span className="material-symbols-outlined">description</span>
              Get a Quote
            </Link>

            <a
              href="https://wa.me/917010220771?text=Hi%20MyVegMarket%2C%20I%20need%20a%20bulk%20supply%20quote."
              target="_blank"
              rel="noreferrer"
              className="flex-1 h-12 rounded-full bg-white border border-[#1db954] text-[#1db954] font-bold flex items-center justify-center gap-2 hover:bg-[#1db954]/5"
            >
              <span className="material-symbols-outlined">forum</span>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
