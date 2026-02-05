"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type ExporterRow = {
  id: string;
  email: string | null;
  exporter_id: string | null;
  approved?: boolean;
  status?: "pending" | "approved" | "rejected";
};

function requireSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    alert("Supabase env missing. Add NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return null;
  }
  return supabase;
}

export default function ExporterVerifyPage() {
  const [loading, setLoading] = useState(false);

  const [emailLookup, setEmailLookup] = useState("");
  const [profile, setProfile] = useState<ExporterRow | null>(null);

  // form
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [tradeLicenseNo, setTradeLicenseNo] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  async function checkStatus() {
    const supabase = requireSupabase();
    if (!supabase) return;

    const email = emailLookup.trim().toLowerCase();
    if (!email) return alert("Enter email");

    setLoading(true);
    const { data, error } = await supabase
      .from("exporter_applications")
      .select("id,email,exporter_id,approved,status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setLoading(false);

    if (error) return alert(error.message);
    setProfile((data as any) ?? null);
  }

  async function submitVerification() {
    const supabase = requireSupabase();
    if (!supabase) return;

    const email = emailLookup.trim().toLowerCase();
    if (!email) return alert("Enter email");
    if (!fullName.trim()) return alert("Enter full name");
    if (!companyName.trim()) return alert("Enter company name");
    if (!phone.trim()) return alert("Enter phone");
    if (!tradeLicenseNo.trim()) return alert("Enter trade license number");

    setLoading(true);

    const payload = {
      email,
      full_name: fullName.trim(),
      contact_person: fullName.trim(),
      company_name: companyName.trim(),
      phone: phone.trim(),
      trade_license_no: tradeLicenseNo.trim(),
      country: country.trim() || null,
      city: city.trim() || null,
    };

    const { data, error } = await supabase
      .from("exporter_applications")
      .insert(payload)
      .select("id,email,exporter_id,approved,status")
      .single();

    setLoading(false);

    if (error) return alert(error.message);
    setProfile(data as any);
    alert("✅ Submitted. Admin will review and approve.");
  }

  const displayStatus = profile?.status ?? (profile?.approved ? "approved" : profile ? "pending" : "");
  const isVerified = profile?.approved === true || profile?.status === "approved";

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-4 sm:px-6 lg:px-12 pt-8 pb-20">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/containers-listing"
            className="w-11 h-11 rounded-full bg-white border border-[#e0e8e3] flex items-center justify-center font-black"
          >
            ←
          </Link>
          <div className="w-11 h-11 rounded-full bg-white border border-[#e0e8e3] flex items-center justify-center">
            👤
          </div>
        </div>

        {/* Check status card */}
        <div className="mt-8 bg-white border border-[#e0e8e3] rounded-[36px] p-8 sm:p-12 shadow-[0_20px_60px_rgba(17,23,19,0.08)]">
          <h1 className="text-4xl sm:text-5xl font-black text-[#111713]">
            Check Verification Status
          </h1>
          <p className="mt-3 text-[#648770] font-medium text-lg">
            Enter your email to check if your company is already verified.
          </p>

          <div className="mt-7">
            <div className="text-sm font-black text-[#111713]">Email Address</div>
            <input
              value={emailLookup}
              onChange={(e) => setEmailLookup(e.target.value)}
              placeholder="e.g. name@company.com"
              className="mt-2 w-full rounded-[22px] border border-[#e0e8e3] px-5 py-4 outline-none font-semibold"
            />
          </div>

          <button
            onClick={checkStatus}
            disabled={loading}
            className="mt-6 w-full rounded-full px-6 py-4 bg-[#eef2ef] text-[#111713] font-black text-lg disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>

          {profile && (
            <div className="mt-6 rounded-[22px] bg-[#f6f8f7] border border-[#e0e8e3] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-[#648770] uppercase">Status</div>
                  <div className="text-xl font-black text-[#111713]">{displayStatus}</div>
                </div>
                <div className="text-sm font-black text-[#111713]">
                  Exporter ID: <span className="text-[#648770]">{profile.exporter_id ?? "-"}</span>
                </div>
              </div>

              {!isVerified ? (
                <p className="mt-3 text-[#648770] font-medium">
                  Your request is under review. Once admin approves, you can create listings.
                </p>
              ) : (
                <div className="mt-4">
                  <p className="text-[#1db954] font-bold">✅ Verified. You can now create listings.</p>
                  <Link
                    href={`/containers-listing/list/create?email=${encodeURIComponent(
                      emailLookup.trim().toLowerCase()
                    )}`}
                    className="inline-block mt-4 rounded-full px-7 py-3 bg-[#1db954] text-white font-black"
                  >
                    Create Listing
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Registration only if not profile */}
        {!profile && (
          <div className="mt-8 bg-white border border-[#e0e8e3] rounded-[36px] p-8 sm:p-12 shadow-[0_20px_60px_rgba(17,23,19,0.08)]">
            <h2 className="text-4xl font-black text-[#111713]">New Exporter Registration</h2>
            <p className="mt-3 text-[#648770] font-medium text-lg">
              Fill in your business details to start the verification process.
            </p>

            <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name" value={fullName} setValue={setFullName} />
              <Field label="Company Name" value={companyName} setValue={setCompanyName} />
              <Field label="Phone Number" value={phone} setValue={setPhone} />
              <Field label="Trade License No" value={tradeLicenseNo} setValue={setTradeLicenseNo} />
              <Field label="Country" value={country} setValue={setCountry} />
              <Field label="City" value={city} setValue={setCity} />
            </div>

            <button
              onClick={submitVerification}
              disabled={loading}
              className="mt-8 w-full rounded-full px-6 py-5 bg-[#1db954] text-white font-black text-xl disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Verification"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm font-black text-[#111713]">{label}</div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full rounded-[22px] border border-[#e0e8e3] px-5 py-4 outline-none font-semibold"
      />
    </label>
  );
}
