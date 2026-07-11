import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminApi } from "@/lib/requireAdminApi";

type ImportRow = {
  rowNumber: number;
  item: string;
  rate: number;
  date: string;
  time: string;
  origin: string;
  min: number;
  max: number;
  category: string;
  status?: "existing" | "new" | "pending";
  productId?: string | null;
  productSlug?: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  origin_country: string | null;
  packaging: string | null;
  unit: string | null;
};

type ImportError = {
  rowNumber: number;
  message: string;
};

const ALLOWED_CATEGORIES = [
  "vegetables",
  "fruits",
  "spices",
  "nuts",
  "eggs",
  "oils",
];

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeCategory(value: unknown): string {
  const category = normalizeText(value);

  const map: Record<string, string> = {
    fruit: "fruits",
    fruits: "fruits",
    vegetable: "vegetables",
    vegetables: "vegetables",
    spice: "spices",
    spices: "spices",
    nut: "nuts",
    nuts: "nuts",
    egg: "eggs",
    eggs: "eggs",
    oil: "oils",
    oils: "oils",
  };

  return map[category] ?? category;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function validateRow(row: ImportRow): string | null {
  if (!row || typeof row !== "object") {
    return "Invalid row format.";
  }

  if (!String(row.item || "").trim()) {
    return "Product name is required.";
  }

  if (!String(row.origin || "").trim()) {
    return "Origin is required.";
  }

  const category = normalizeCategory(row.category);

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return `Invalid category "${row.category}".`;
  }

  const rate = Number(row.rate);
  const min = Number(row.min);
  const max = Number(row.max);

  if (!Number.isFinite(rate) || rate <= 0) {
    return "Rate must be greater than zero.";
  }

  if (!Number.isFinite(min) || min < 0) {
    return "Min must be a valid non-negative number.";
  }

  if (!Number.isFinite(max) || max < 0) {
    return "Max must be a valid non-negative number.";
  }

  if (min > max) {
    return "Min cannot be greater than Max.";
  }

  if (rate < min || rate > max) {
    return "Rate must be between Min and Max.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(row.date || ""))) {
    return "Date must use YYYY-MM-DD format.";
  }

  if (!/^\d{2}:\d{2}$/.test(String(row.time || ""))) {
    return "Time must use HH:mm format.";
  }

  const dateTime = new Date(`${row.date}T${row.time}:00`);

  if (Number.isNaN(dateTime.getTime())) {
    return "Date or time is invalid.";
  }

  return null;
}

async function findExistingProduct(
  row: ImportRow
): Promise<ProductRow | null> {
  if (row.productId) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id,slug,name,category,origin_country,packaging,unit"
      )
      .eq("id", row.productId)
      .maybeSingle<ProductRow>();

    if (!error && data) {
      return data;
    }
  }

  if (row.productSlug) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id,slug,name,category,origin_country,packaging,unit"
      )
      .eq("slug", row.productSlug)
      .maybeSingle<ProductRow>();

    if (!error && data) {
      return data;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "id,slug,name,category,origin_country,packaging,unit"
    )
    .limit(10000);

  if (error) {
    throw new Error(error.message);
  }

  const products = (data ?? []) as ProductRow[];

  const itemKey = normalizeText(row.item);
  const categoryKey = normalizeCategory(row.category);
  const originKey = normalizeText(row.origin);

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

  return match ?? null;
}

async function getNextSortOrder(category: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("sort_order")
    .eq("category", category)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const currentMax = Number(data?.[0]?.sort_order ?? 0);
  return currentMax + 1;
}

async function createUniqueSlug(
  row: ImportRow
): Promise<string> {
  const category = normalizeCategory(row.category);

  const baseSlug =
    slugify(`${category}-${row.item}-${row.origin}`) ||
    slugify(`${category}-${row.item}`) ||
    `product-${Date.now()}`;

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function alreadyImported(
  productKey: string,
  publishedAt: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("price_updates")
    .select("id")
    .eq("product_key", productKey)
    .eq("source", "excel")
    .eq("published_at", publishedAt)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.length);
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminApi(request);

    if (!admin.ok) {
      return admin.response;
    }

    const body = await request.json().catch(() => null);

    const rows = Array.isArray(body?.rows)
      ? (body.rows as ImportRow[])
      : [];

    if (rows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "No Excel rows were provided.",
        },
        { status: 400 }
      );
    }

    if (rows.length > 5000) {
      return NextResponse.json(
        {
          ok: false,
          error: "A maximum of 5,000 rows can be imported at once.",
        },
        { status: 400 }
      );
    }

    let updated = 0;
    let created = 0;
    let historyInserted = 0;
    let failed = 0;
    let skipped = 0;

    const errors: ImportError[] = [];

    for (const row of rows) {
      try {
        const validationError = validateRow(row);

        if (validationError) {
          failed += 1;
          errors.push({
            rowNumber: Number(row.rowNumber || 0),
            message: validationError,
          });
          continue;
        }

        const category = normalizeCategory(row.category);
        const productName = String(row.item).trim();
        const origin = String(row.origin).trim();

        const rate = Number(row.rate);
        const minPrice = Number(row.min);
        const maxPrice = Number(row.max);

        const effectiveDateTime = new Date(
          `${row.date}T${row.time}:00`
        ).toISOString();

        let product = await findExistingProduct(row);
        let productWasCreated = false;

        if (!product) {
          const slug = await createUniqueSlug(row);
          const sortOrder = await getNextSortOrder(category);

          const { data: createdProduct, error: createError } =
            await supabaseAdmin
              .from("products")
              .insert({
                slug,
                name: productName,
                category,
                unit: "kg",
                image_url: null,
                active: true,
                sort_order: sortOrder,
                market_price_aed: rate,
                myveg_price_aed: null,
                price_note: "Imported from Al Aweer Excel",
                packaging: null,
                origin_country: origin,
                shipment_mode: null,
                updated_at: effectiveDateTime,
              })
              .select(
                "id,slug,name,category,origin_country,packaging,unit"
              )
              .maybeSingle<ProductRow>();

          if (createError || !createdProduct) {
            throw new Error(
              createError?.message || "Product could not be created."
            );
          }

          product = createdProduct;
          productWasCreated = true;
          created += 1;
        } else {
          const { error: updateError } = await supabaseAdmin
            .from("products")
            .update({
              market_price_aed: rate,
              origin_country: origin,
              category,
              updated_at: effectiveDateTime,
            })
            .eq("id", product.id);

          if (updateError) {
            throw new Error(updateError.message);
          }

          updated += 1;
        }

        const duplicate = await alreadyImported(
          product.slug,
          effectiveDateTime
        );

        if (duplicate) {
          skipped += 1;

          if (productWasCreated) {
            created -= 1;
          } else {
            updated -= 1;
          }

          continue;
        }

        const { error: priceUpdateError } = await supabaseAdmin
          .from("price_updates")
          .insert({
            submitted_by: admin.userId,
            submitted_by_email: admin.email,

            product_key: product.slug,
            is_new_product: productWasCreated,

            category,
            name: productName,
            variety: null,

            country: origin,
            origin_country: origin,

            price: rate,
            min_price: minPrice,
            max_price: maxPrice,

            currency: "AED",
            image_url: null,

            status: "approved",
            source: "excel",

            reviewed_by: admin.userId,
            reviewed_at: effectiveDateTime,
            review_note: `Bulk Excel import${
              body?.fileName ? `: ${String(body.fileName)}` : ""
            }`,

            created_at: effectiveDateTime,

            updater_id: null,
            updater_name: "Admin Excel Import",
            updater_secret_hash: null,

            published_product_id: product.id,
            published_at: effectiveDateTime,

            packaging: product.packaging || null,
            unit: product.unit || "kg",
          });

        if (priceUpdateError) {
          throw new Error(
            `Price update insert failed: ${priceUpdateError.message}`
          );
        }

        const { error: historyError } = await supabaseAdmin
          .from("price_history")
          .insert({
            product_key: product.slug,
            day: row.date,
            price: rate,
            currency: "AED",
            published_at: effectiveDateTime,
            updater_name: "Admin Excel Import",
            category,
            name: productName,
            origin_country: origin,
            unit: product.unit || "kg",
            packaging: product.packaging || null,
            source: "excel",
            ts: effectiveDateTime,
          });

        if (historyError) {
          errors.push({
            rowNumber: row.rowNumber,
            message: `Price imported, but history insert failed: ${historyError.message}`,
          });
        } else {
          historyInserted += 1;
        }
      } catch (error: unknown) {
        failed += 1;

        errors.push({
          rowNumber: Number(row?.rowNumber || 0),
          message:
            error instanceof Error
              ? error.message
              : "Unknown import error.",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      updated,
      created,
      historyInserted,
      skipped,
      failed,
      errors,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Bulk Excel import failed.",
      },
      { status: 500 }
    );
  }
}