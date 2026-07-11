import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminApiSuccess = {
  ok: true;
  userId: string;
  email: string;
};

export type AdminApiFailure = {
  ok: false;
  response: NextResponse;
};

export async function requireAdminApi(
  request: Request
): Promise<AdminApiSuccess | AdminApiFailure> {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Missing admin access token." },
        { status: 401 }
      ),
    };
  }

  const accessToken = authorization.slice("Bearer ".length).trim();

  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Missing admin access token." },
        { status: 401 }
      ),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user?.email) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Invalid or expired admin session." },
        { status: 401 }
      ),
    };
  }

  const email = user.email.trim().toLowerCase();

  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from("admin_allowlist")
    .select("email,role,is_active")
    .ilike("email", email)
    .eq("role", "admin")
    .eq("is_active", true)
    .maybeSingle();

  if (adminError) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: adminError.message },
        { status: 500 }
      ),
    };
  }

  if (!adminRow) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    userId: user.id,
    email,
  };
}