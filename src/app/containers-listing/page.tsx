"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Status = "pending" | "approved" | "rejected";
type PaymentStatus = "unpaid" | "paid";

type ExporterRow = {
  id: string;
  exporter_id: string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  trade_license_no: string;
  country: string;
  city: string;
  status: Status;
  payment_status: PaymentStatus;
};

export default function ContainersListingPage() {
  const [loading, setLoading] = useState(false);

  // simple "local login" for now using email (later we’ll replace with real auth)
  const [emailLookup, setEmailLookup] = useState("");

  const [profile, setProfile] = useState<ExporterRow | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [tradeLicenseNo, setTradeLicenseNo] = useState("");
  const [country, setCountry] = useState("UAE");
  const [city, setCity] = useState("");

  async function fetchProfileByEmail(email: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("exporter_applications")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }
    setProfile((data as any) ?? null);
  }

  async function submitApplication() {
    if (!emailLookup.trim()) return alert("Please enter your email.");
    if (!fullName.trim()) return alert("Enter full name");
    if (!companyName.trim()) return alert("Enter company name");
    if (!phone.trim()) return alert("Enter phone");
    if (!tradeLicenseNo.trim()) return alert("Enter trade license number");
    if (!country.trim()) return alert("Enter country");
    if (!city.trim()) return alert("Enter city");

    setLoading(true);

   const payload = {
  full_name: fullName,
  contact_person: fullName,
  company_name: companyName,
  email: emailLookup.trim(),
  phone,
  trade_license_no: tradeLicenseNo,
  country,
  city,
  // ✅ DON’T SEND status/payment_status from frontend
};


    const { data, error } = await supabase
      .from("exporter_applications")
      .insert([payload])
      .select("*")
      .single();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setProfile(data as any);
  }

  // UI helpers
  const isLocked =
    !profile || profile.status !== "approved" || profile.payment_status !== "paid";

  return (
    <main className="bg-[#f6f8f7] min-h-screen px-6 lg:px-20 pt-10 pb-24">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-4xl font-black text-[#111713]">Containers Listing</h1>
        <p className="text-[#648770] font-medium mt-2">
          Exporter verification is required before listing containers.
        </p>

        {/* Step 1: lookup */}
        <div className="mt-6 bg-white border border-[#e0e8e3] rounded-[26px] p-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1">
              <div className="text-sm font-black text-[#111713]">Enter your email</div>
              <input
                value={emailLookup}
                onChange={(e) => setEmailLookup(e.target.value)}
                placeholder="your@email.com"
                className="mt-2 w-full rounded-2xl border border-[#e0e8e3] px-4 py-3 outline-none focus:ring-2 focus:ring-[#1db954]/20"
              />
            </div>

            <button
              onClick={() => fetchProfileByEmail(emailLookup.trim())}
              disabled={loading || !emailLookup.trim()}
              className="h-[48px] px-6 rounded-full bg-[#111713] text-white font-black disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check Status"}
            </button>
          </div>

          {/* If profile exists */}
          {profile && (
            <div className="mt-5 rounded-2xl bg-[#f6f8f7] border border-[#e0e8e3] p-5">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <div className="text-xs font-black text-[#648770] uppercase">
                    Your Exporter ID
                  </div>
                  <div className="text-2xl font-black text-[#111713]">
                    {profile.exporter_id}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-2 rounded-full text-xs font-black border bg-white">
                    Status: {profile.status}
                  </span>
                  <span className="px-3 py-2 rounded-full text-xs font-black border bg-white">
                    Payment: {profile.payment_status}
                  </span>
                </div>
              </div>

              {isLocked ? (
                <div className="mt-4 text-sm font-medium text-[#648770]">
                  🔒 Containers listing is locked until you are <b>approved</b> and
                  <b> paid</b>.
                </div>
              ) : (
                <div className="mt-4 text-sm font-medium text-[#1db954]">
                  ✅ Unlocked. You can now list containers.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: application form (only if no profile) */}
        {!profile && (
          <div className="mt-8 bg-white border border-[#e0e8e3] rounded-[26px] p-6">
            <h2 className="text-xl font-black text-[#111713]">
              Verification Form
            </h2>
            <p className="text-sm text-[#648770] font-medium mt-1">
              Fill details once. After submit, it cannot be edited.
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" value={fullName} onChange={setFullName} />
              <Input label="Company Name" value={companyName} onChange={setCompanyName} />
              <Input label="Phone" value={phone} onChange={setPhone} />
              <Input label="Trade License No" value={tradeLicenseNo} onChange={setTradeLicenseNo} />
              <Input label="Country" value={country} onChange={setCountry} />
              <Input label="City" value={city} onChange={setCity} />
            </div>

            <button
              onClick={submitApplication}
              disabled={loading}
              className="mt-6 w-full md:w-auto px-8 py-3 rounded-full bg-[#1db954] text-white font-black disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Verification"}
            </button>
          </div>
        )}

        {/* Step 3: Payment Gate + Container Listing (placeholder for now) */}
        {profile && (
          <div className="mt-8 bg-white border border-[#e0e8e3] rounded-[26px] p-6">
            <h2 className="text-xl font-black text-[#111713]">
              Subscription & Listing
            </h2>

            {profile.status !== "approved" ? (
              <p className="mt-2 text-[#648770] font-medium">
                Your account is under review. We will approve manually.
              </p>
            ) : profile.payment_status !== "paid" ? (
              <div className="mt-2">
                <p className="text-[#648770] font-medium">
                  Approved ✅ Now complete payment to unlock containers listing.
                </p>

                <button
                  className="mt-4 px-8 py-3 rounded-full bg-[#111713] text-white font-black"
                  onClick={() => alert("Next step: integrate payment gateway")}
                >
                  Pay & Subscribe
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-[#1db954] font-medium">
                  Payment done ✅ Listing unlocked.
                </p>
                <button
                  className="mt-4 px-8 py-3 rounded-full bg-[#1db954] text-white font-black"
                  onClick={() => alert("Next step: open container listing form")}
                >
                  List a Container
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm font-black text-[#111713]">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-[#e0e8e3] px-4 py-3 outline-none focus:ring-2 focus:ring-[#1db954]/20"
      />
    </label>
  );
}
