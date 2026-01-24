"use client";

import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();

    if (!phone || phone.length < 8) {
      alert("Enter a valid phone number");
      return;
    }

    // ✅ mock OTP generation
    const newOtp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(newOtp);

    alert(`Demo OTP: ${newOtp}`); // ✅ For now it will show in alert
    setStep("otp");
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    if (otp === generatedOtp) {
      alert("✅ Login success!");
      window.location.href = "/";
    } else {
      alert("❌ Invalid OTP");
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-[#e0e8e3] rounded-3xl shadow-sm p-8">
        <h1 className="text-3xl font-black text-[#111713] mb-2">Sign In</h1>
        <p className="text-[#648770] font-medium mb-8">
          Login using your phone number
        </p>

        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full h-12 px-5 rounded-full bg-[#f0f4f2] outline-none font-semibold"
            />

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-[#1db954] text-white font-bold hover:opacity-90"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full h-12 px-5 rounded-full bg-[#f0f4f2] outline-none font-semibold"
            />

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-[#0B5D1E] text-white font-bold hover:opacity-90"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-sm font-bold text-[#648770] hover:text-[#1db954]"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

