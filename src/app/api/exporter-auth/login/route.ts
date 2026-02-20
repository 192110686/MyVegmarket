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

  const { data: account, error } = await supabaseAdmin
    .from("exporter_accounts")
    .select("id,email,password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error || !account) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, account.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const session_token = makeToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { error: sErr } = await supabaseAdmin.from("exporter_sessions").insert([
    { account_id: account.id, session_token, expires_at: expires.toISOString() },
  ]);

  if (sErr) {
    return NextResponse.json({ error: sErr.message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, email: account.email });

  res.cookies.set(COOKIE_NAME, session_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  return res;
}
