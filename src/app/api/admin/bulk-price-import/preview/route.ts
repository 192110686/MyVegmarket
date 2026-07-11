import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminApi } from "@/lib/requireAdminApi";

type PreviewInputRow = {
  rowNumber: number;
  item: string;
  rate: number;
  date: string;
  time: string;
  origin: string;
  min: number;
  max: number;
  category: string;
};

type ExistingProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  origin_country: string | null;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminApi(request);

    if (!admin.ok) {
      return admin.response;
    }

    const body = await request.json().catch(() => null);
    const rows = Array.isArray(body?.rows)
      ? (body.rows as PreviewInputRow[])
      : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No Excel rows were provided." },
        { status: 400 }
      );
    }

    if (rows.length > 5000) {
      return NextResponse.json(
        {
          ok: false,
          error: "A maximum of 5,000 rows can be previewed at once.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id,slug,name,category,origin_country")
      .limit(10000);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const products = (data ?? []) as ExistingProduct[];

    const resultRows = rows.map((row) => {
      const itemKey = normalizeText(row.item);
      const categoryKey = normalizeText(row.category);
      const originKey = normalizeText(row.origin);

      /*
       * Matching priority:
       * 1. Same name + category + origin
       * 2. Same name + category
       * 3. Same name
       */
      let match = products.find(
        (product) =>
          normalizeText(product.name) === itemKey &&
          normalizeText(product.category) === categoryKey &&
          normalizeText(product.origin_country) === originKey
      );

      if (!match) {
        match = products.find(
          (product) =>
            normalizeText(product.name) === itemKey &&
            normalizeText(product.category) === categoryKey
        );
      }

      if (!match) {
        match = products.find(
          (product) => normalizeText(product.name) === itemKey
        );
      }

      return {
        rowNumber: row.rowNumber,
        status: match ? ("existing" as const) : ("new" as const),
        productId: match?.id ?? null,
        productSlug: match?.slug ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      rows: resultRows,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to preview Excel products.",
      },
      { status: 500 }
    );
  }
}