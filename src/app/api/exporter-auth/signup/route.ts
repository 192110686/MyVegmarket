import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const COOKIE_NAME = "mv_exporter_session";

function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = (body?.email ?? "").trim().toLowerCase();
  const password = (body?.password ?? "").trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  // prevent duplicate email
  const { data: exists } = await supabaseAdmin
    .from("exporter_accounts")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (exists?.id) {
    return NextResponse.json({ error: "Email already registered. Please login." }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 12);

  // create account
  const { data: account, error: accErr } = await supabaseAdmin
    .from("exporter_accounts")
    .insert([{ email, password_hash }])
    .select("id,email")
    .single();

  if (accErr || !account) {
    return NextResponse.json({ error: accErr?.message ?? "Signup failed" }, { status: 500 });
  }

  // create long session (e.g., 30 days)
  const session_token = makeToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const { error: sErr } = await supabaseAdmin.from("exporter_sessions").insert([
    {
      account_id: account.id,
      session_token,
      expires_at: expires.toISOString(),
    },
  ]);

  if (sErr) {
    return NextResponse.json({ error: sErr.message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, email: account.email });

  // secure cookie
  res.cookies.set(COOKIE_NAME, session_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  return res;
}
