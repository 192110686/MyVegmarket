"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("yksample@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signIn() {
    setErr(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErr("Enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.error("Supabase login error:", {
          message: error.message,
          status: error.status,
          code: error.code,
        });

        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErr(
            "Invalid email or password. Please check that this admin user exists in the production Supabase project."
          );
        } else {
          setErr(error.message);
        }

        return;
      }

      if (!data.session || !data.user) {
        setErr("Login succeeded, but no user session was created.");
        return;
      }

      router.replace("/admin/price-approvals");
      router.refresh();
    } catch (error) {
      console.error("Admin login failed:", error);

      setErr(
        error instanceof Error
          ? error.message
          : "Unable to connect to Supabase."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !loading) {
      void signIn();
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6f8f7] px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[560px] rounded-[28px] border border-[#e0e8e3] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-[#111713]">
          Admin Login
        </h1>

        <p className="mt-1 font-semibold text-[#648770]">
          Log in using an admin account.
        </p>

        <div className="mt-6">
          <label
            htmlFor="admin-email"
            className="mb-2 block text-sm font-black text-[#111713]"
          >
            Email
          </label>

          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-[18px] border border-[#e0e8e3] bg-[#f6f8f7] px-4 font-semibold outline-none"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-black text-[#111713]"
          >
            Password
          </label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-[18px] border border-[#e0e8e3] bg-[#f6f8f7] px-4 font-semibold outline-none"
          />
        </div>

        {err && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
            {err}
          </div>
        )}

        <button
          type="button"
          onClick={() => void signIn()}
          disabled={loading}
          className="mt-6 h-12 w-full rounded-full bg-[#1db954] font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Login & Open Approvals"}
        </button>
      </div>
    </main>
  );
}