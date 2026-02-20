import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const secret = String(body?.secret || "").trim();
    const payload = body?.payload || null;

    if (!secret) return NextResponse.json({ ok: false, error: "Missing secret" }, { status: 400 });
    if (!payload) return NextResponse.json({ ok: false, error: "Missing payload" }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json(
        { ok: false, error: "Server not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    // 1) Verify updater
    const secret_hash = sha256Hex(secret);
    const { data: upd, error: updErr } = await supabase
      .from("updaters")
      .select("id,name,is_active")
      .eq("secret_hash", secret_hash)
      .eq("is_active", true)
      .maybeSingle();

    if (updErr || !upd) return NextResponse.json({ ok: false, error: "Invalid / inactive secret" }, { status: 401 });

    // 2) Validate required fields
    const mode = payload.mode === "new" ? "new" : "existing";
    const name = String(payload.name || "").trim();
    const category = String(payload.category || "").trim();
    const origin_country = String(payload.origin_country || "").trim();
    const packaging = String(payload.packaging || "").trim();
    const unit = String(payload.unit || "").trim();
    const variety = String(payload.variety || "").trim();
    const currency = String(payload.currency || "AED").trim() || "AED";
    const priceNum = Number(payload.price);

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid price" }, { status: 400 });
    }

    if (!name || !category) {
      return NextResponse.json({ ok: false, error: "Name and category are required" }, { status: 400 });
    }

    // For NEW product, require origin + packaging + unit (you said these tags should be filled)
    if (mode === "new") {
      if (!origin_country) return NextResponse.json({ ok: false, error: "Origin country required" }, { status: 400 });
      if (!packaging) return NextResponse.json({ ok: false, error: "Packaging required" }, { status: 400 });
      if (!unit) return NextResponse.json({ ok: false, error: "Unit required" }, { status: 400 });
    }

    const product_key = String(payload.product_key || "").trim() || `${category}-${name}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

    // 3) Insert into price_updates (pending)
    const insertRow = {
      submitted_by: upd.id,
      submitted_by_email: null, // keep null since we're not using email auth
      updater_name: upd.name,

      product_key,
      is_new_product: mode === "new",
      category,
      name,

      variety: variety || null,
      country: origin_country || null, // your table uses "country" column
      origin_country: origin_country || null, // extra column we added (recommended)
      packaging: packaging || null,
      unit: unit || null,

      price: priceNum,
      currency,
      image_url: null,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { error: insErr } = await supabase.from("price_updates").insert(insertRow);
    if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
