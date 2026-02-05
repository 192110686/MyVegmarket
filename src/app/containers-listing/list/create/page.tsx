"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

type ExporterRow = {
  id: string;
  email: string | null;
  exporter_id: string | null;
  approved?: boolean;
  status?: "pending" | "approved" | "rejected";
  company_name?: string | null;
  contact_person?: string | null;
  phone?: string | null;
};

function requireSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    alert("Supabase env missing. Add NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return null;
  }
  return supabase;
}

export default function CreateContainerListingPage() {
  const router = useRouter();
  const params = useSearchParams();

  const email = (params.get("email") ?? "").trim().toLowerCase();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ExporterRow | null>(null);

  // Form fields (your UI)
  const [commodity, setCommodity] = useState("");
  const [origin, setOrigin] = useState("");
  const [packaging, setPackaging] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  // optional helpers
  const [currency, setCurrency] = useState("USD");
  const [quantityUnit, setQuantityUnit] = useState("Units");

  // Required-by-table but not shown in your UI (we set safe defaults for now)
  const destination = "N/A";
  const containerType = "standard";
  const readyDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  useEffect(() => {
    if (!email) return;

    (async () => {
      const supabase = requireSupabase();
      if (!supabase) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("exporter_applications")
        .select("id,email,exporter_id,approved,status,company_name,contact_person,phone")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLoading(false);

      if (error) return alert(error.message);
      setProfile((data as any) ?? null);
    })();
  }, [email]);

  const isVerified = useMemo(() => {
    return profile?.approved === true || profile?.status === "approved";
  }, [profile]);

  async function publishListing() {
    const supabase = requireSupabase();
    if (!supabase) return;

    if (!email) return alert("Missing email in URL. Go back and try again.");
    if (!profile) return alert("Exporter profile not found. Go back and check verification.");
    if (!isVerified) return alert("Not approved yet. Please wait for admin approval.");

    if (!commodity.trim()) return alert("Enter product name");
    if (!origin.trim()) return alert("Enter country");
    if (!packaging.trim()) return alert("Enter packing type");

    const qtyNum = Number(quantity);
    if (!quantity.trim() || Number.isNaN(qtyNum) || qtyNum <= 0) {
      return alert("Enter a valid quantity");
    }

    const priceNum = price.trim() ? Number(price) : null;
    if (price.trim() && (priceNum === null || Number.isNaN(priceNum) || priceNum < 0)) {
      return alert("Enter a valid price");
    }

    // exporter_id is NOT NULL in your container_listings
    if (!profile.exporter_id) {
      return alert("Exporter ID missing. Ask admin to generate exporter_id for your profile.");
    }

    // whatsapp is NOT NULL in your container_listings
    const whatsapp = (profile.phone ?? "").trim();
    if (!whatsapp) {
      return alert("Phone number missing in exporter profile. Please update exporter_applications.phone.");
    }

    setLoading(true);

    const payload = {
      exporter_id: profile.exporter_id,
      email: email,

      commodity: commodity.trim(),
      origin: origin.trim(),
      packaging: packaging.trim(),

      quantity: qtyNum,
      quantity_unit: quantityUnit,

      price: priceNum,
      currency: currency,

      // required non-UI fields
      destination,
      whatsapp,
      container_type: containerType,
      ready_date: readyDate,

      // admin review flow
      status: "pending",

      // optional extra fields (if exists)
      company_name: profile.company_name ?? null,
      contact_person: profile.contact_person ?? null,
    };

    const { error } = await supabase.from("container_listings").insert(payload);

    setLoading(false);

    if (error) return alert(error.message);

    alert("✅ Listing submitted! Admin will review and publish it soon.");
    router.push("/containers-listing/list");
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-4 sm:px-6 lg:px-12 pt-8 pb-20">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/containers-listing/list"
            className="w-11 h-11 rounded-full bg-white border border-[#e0e8e3] flex items-center justify-center font-black"
          >
            ←
          </Link>
          <div className="w-11 h-11 rounded-full bg-white border border-[#e0e8e3] flex items-center justify-center">
            👤
          </div>
        </div>

        {/* Badge row (like your UI) */}
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="px-4 py-2 rounded-full bg-[#eaf7ef] text-[#1db954] font-black border border-[#bfe8cd]">
            ✓ Approved
          </span>
          <span className="px-4 py-2 rounded-full bg-[#eaf7ef] text-[#1db954] font-black border border-[#bfe8cd]">
            ✓ Verified
          </span>
        </div>

        {/* Account Status card */}
        <div className="mt-6 bg-white border border-[#e0e8e3] rounded-[36px] p-8 sm:p-12 shadow-[0_20px_60px_rgba(17,23,19,0.08)]">
          <h1 className="text-4xl sm:text-5xl font-black text-[#111713]">
            Exporter Account Status
          </h1>
          <p className="mt-3 text-[#648770] font-medium text-lg">
            {email
              ? isVerified
                ? "Your account is verified. You can submit listings for admin review."
                : "Your account is not approved yet. Please wait for admin approval."
              : "Missing exporter email. Go back and open Create Listing again."}
          </p>
        </div>

        {/* Create Listing card */}
        <div className="mt-8 bg-white border border-[#e0e8e3] rounded-[36px] p-8 sm:p-12 shadow-[0_20px_60px_rgba(17,23,19,0.08)]">
          <div className="space-y-6">
            <Field
              label="Product Name"
              value={commodity}
              setValue={setCommodity}
              placeholder="Select Product"
              disabled={!isVerified || loading}
            />

            <Field
              label="Country"
              value={origin}
              setValue={setOrigin}
              placeholder="Select Country"
              disabled={!isVerified || loading}
            />

            <Field
              label="Packing Type"
              value={packaging}
              setValue={setPackaging}
              placeholder="Select Packing Type"
              disabled={!isVerified || loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="QTY"
                value={quantity}
                setValue={setQuantity}
                placeholder="0"
                disabled={!isVerified || loading}
              />

              <Field
                label="Price"
                value={price}
                setValue={setPrice}
                placeholder="0.00"
                disabled={!isVerified || loading}
              />
            </div>

            {/* Optional dropdowns (safe helpers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField
                label="Quantity Unit"
                value={quantityUnit}
                setValue={setQuantityUnit}
                options={["Units", "Boxes", "Cartons", "Crates", "Kg", "Tons"]}
                disabled={!isVerified || loading}
              />

              <SelectField
                label="Currency"
                value={currency}
                setValue={setCurrency}
                options={["USD", "AED", "INR", "EUR"]}
                disabled={!isVerified || loading}
              />
            </div>

            <button
              onClick={publishListing}
              disabled={!isVerified || loading}
              className="w-full rounded-full px-6 py-5 bg-[#1db954] text-white font-black text-xl disabled:opacity-60"
            >
              {loading ? "Publishing..." : "Publish Listing"}
            </button>

            <div className="text-center text-sm font-semibold text-[#8aa59a]">
              By publishing, you agree to our Terms of Service
            </div>
          </div>
        </div>

        {!isVerified && (
          <div className="mt-6 bg-white border border-[#e0e8e3] rounded-[26px] p-6">
            <div className="text-lg font-black text-[#111713]">Not approved yet</div>
            <p className="mt-2 text-[#648770] font-medium">
              Once admin approves your exporter profile, you can publish listings here.
            </p>
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
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-sm font-black text-[#111713]">{label}</div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-2 w-full rounded-[22px] border border-[#e0e8e3] px-5 py-4 outline-none font-semibold disabled:bg-[#f6f8f7]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  setValue,
  options,
  disabled,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-sm font-black text-[#111713]">{label}</div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        className="mt-2 w-full rounded-[22px] border border-[#e0e8e3] px-5 py-4 outline-none font-black disabled:bg-[#f6f8f7]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
