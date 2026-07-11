"use client";
import { getSupabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { requireRole } from "@/lib/roles";
import {
  ExcelParseResult,
  ExcelPriceRow,
  parsePriceExcelFile,
} from "@/lib/excelImport";

type PreviewStatus = "pending" | "existing" | "new" | "invalid";

type PreviewRow = ExcelPriceRow & {
  status: PreviewStatus;
  productId?: string | null;
  productSlug?: string | null;
};

type ProductMatchResponse = {
  ok: boolean;
  rows?: Array<{
    rowNumber: number;
    status: "existing" | "new";
    productId: string | null;
    productSlug: string | null;
  }>;
  error?: string;
};

type ImportResponse = {
  ok: boolean;
  updated?: number;
  created?: number;
  historyInserted?: number;
  skipped?: number;
  failed?: number;
  errors?: Array<{
    rowNumber: number;
    message: string;
  }>;
  error?: string;
};
async function getAdminAccessToken() {
  const supabase = getSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.access_token) {
    throw new Error("Admin session expired. Please log in again.");
  }

  return session.access_token;
}
export default function BulkPriceImportPage() {
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);

  const [parsing, setParsing] = useState(false);
  const [checkingProducts, setCheckingProducts] = useState(false);
  const [importing, setImporting] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const result = await requireRole(["admin"]);

      if (!mounted) return;

      setAllowed(result.ok);
      setCheckingAccess(false);
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const existing = previewRows.filter(
      (row) => row.status === "existing"
    ).length;

    const newProducts = previewRows.filter(
      (row) => row.status === "new"
    ).length;

    return {
      total: parseResult?.totalRows ?? 0,
      valid: parseResult?.rows.length ?? 0,
      invalid: parseResult?.errors.length ?? 0,
      existing,
      newProducts,
    };
  }, [parseResult, previewRows]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setParseResult(null);
    setPreviewRows([]);
    setImportResult(null);
    setMessage(null);

    if (!selectedFile) return;

    setParsing(true);

    try {
      const result = await parsePriceExcelFile(selectedFile);

      setParseResult(result);

      const initialRows: PreviewRow[] = result.rows.map((row) => ({
        ...row,
        status: "pending",
      }));

      setPreviewRows(initialRows);

      if (result.errors.length > 0) {
        setMessage(
          `${result.errors.length} validation issue(s) found. Fix the invalid Excel rows before importing.`
        );
      } else {
        setMessage(
          `${result.rows.length} valid row(s) read from worksheet "${result.sheetName}".`
        );
      }
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to read the Excel file."
      );
    } finally {
      setParsing(false);
    }
  }

  async function checkProducts() {
    if (!parseResult || parseResult.rows.length === 0) {
      setMessage("No valid Excel rows are available.");
      return;
    }

    if (parseResult.errors.length > 0) {
      setMessage(
        "Please correct all invalid Excel rows before checking products."
      );
      return;
    }

    setCheckingProducts(true);
    setMessage(null);
    setImportResult(null);

    try {
      const accessToken = await getAdminAccessToken();
      const response = await fetch("/api/admin/bulk-price-import/preview", {
        method: "POST",
       headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessToken}`,
},
        body: JSON.stringify({
          rows: parseResult.rows,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as ProductMatchResponse;

      if (!response.ok || !result.ok || !result.rows) {
        throw new Error(result.error || "Product matching failed.");
      }

      const matchByRowNumber = new Map(
        result.rows.map((row) => [row.rowNumber, row])
      );

      setPreviewRows(
        parseResult.rows.map((row) => {
          const match = matchByRowNumber.get(row.rowNumber);

          return {
            ...row,
            status: match?.status ?? "new",
            productId: match?.productId ?? null,
            productSlug: match?.productSlug ?? null,
          };
        })
      );

      const existingCount = result.rows.filter(
        (row) => row.status === "existing"
      ).length;

      const newCount = result.rows.filter(
        (row) => row.status === "new"
      ).length;

      setMessage(
        `Product check completed: ${existingCount} existing and ${newCount} new product(s).`
      );
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to check products."
      );
    } finally {
      setCheckingProducts(false);
    }
  }

  async function importRows() {
    if (!parseResult || parseResult.rows.length === 0) {
      setMessage("No valid Excel rows are available.");
      return;
    }

    if (parseResult.errors.length > 0) {
      setMessage("Correct the invalid Excel rows before importing.");
      return;
    }

    const uncheckedRows = previewRows.filter(
      (row) => row.status === "pending"
    );

    if (uncheckedRows.length > 0) {
      setMessage('Click "Check Products" before importing.');
      return;
    }

    const confirmed = window.confirm(
      `Import ${previewRows.length} price row(s)?\n\n` +
        `${stats.existing} existing products will be updated.\n` +
        `${stats.newProducts} new products will be created.`
    );

    if (!confirmed) return;

    setImporting(true);
    setMessage(null);
    setImportResult(null);

    try {
      const accessToken = await getAdminAccessToken();

      const response = await fetch("/api/admin/bulk-price-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          rows: previewRows,
          fileName: file?.name ?? null,
          sheetName: parseResult.sheetName,
        }),
      });

      const result = (await response
        .json()
        .catch(() => ({}))) as ImportResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Excel import failed.");
      }

      setImportResult(result);

      setMessage(
        `Import completed. ${result.updated ?? 0} updated, ` +
          `${result.created ?? 0} created, ` +
          `${result.skipped ?? 0} skipped and ` +
          `${result.failed ?? 0} failed.`
      );
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Excel import failed."
      );
    } finally {
      setImporting(false);
    }
  }

  function resetImport() {
    setFile(null);
    setParseResult(null);
    setPreviewRows([]);
    setMessage(null);
    setImportResult(null);

    const input = document.getElementById(
      "bulk-price-file"
    ) as HTMLInputElement | null;

    if (input) input.value = "";
  }

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-[#f6f8f7] px-4 py-10">
        <div className="mx-auto max-w-[1200px] font-bold text-[#111713]">
          Checking admin access…
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[#f6f8f7] px-4 py-10">
        <div className="mx-auto max-w-[800px] rounded-[28px] border border-[#e0e8e3] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-[#111713]">
            Admin access required
          </h1>

          <p className="mt-2 font-semibold text-[#648770]">
            Please sign in using an approved admin account.
          </p>

          <Link
            href="/admin-login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#1db954] px-6 font-black text-white"
          >
            Go to Admin Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#111713] sm:text-4xl">
              Bulk Price Import
            </h1>

            <p className="mt-1 font-semibold text-[#648770]">
              Upload the daily Al Aweer Excel file, review the rows and import
              the prices.
            </p>
          </div>

          <Link
            href="/admin/price-approvals"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#e0e8e3] bg-white px-5 font-black text-[#111713]"
          >
            Back to Price Approvals
          </Link>
        </div>

        <div className="rounded-[28px] border border-[#e0e8e3] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="block text-sm font-black text-[#111713]">
                Choose Excel file
              </label>

              <input
                id="bulk-price-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={parsing || importing}
                className="mt-3 block w-full rounded-[18px] border border-[#e0e8e3] bg-[#f6f8f7] p-4 font-semibold text-[#111713]"
              />

              <p className="mt-3 text-sm font-semibold text-[#648770]">
                Required columns: Item, Rate, Date, Time, Origin, Min, Max and
                Category.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e0e8e3] bg-[#f6f8f7] p-5">
              <div className="text-xs font-black uppercase tracking-wide text-[#8aa59a]">
                Selected file
              </div>

              <div className="mt-2 break-all text-lg font-black text-[#111713]">
                {file?.name || "No file selected"}
              </div>

              {parseResult && (
                <div className="mt-2 text-sm font-semibold text-[#648770]">
                  Worksheet: {parseResult.sheetName}
                </div>
              )}
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-[18px] border border-[#e0e8e3] bg-white px-5 py-4 font-semibold text-[#111713] shadow-sm">
              {message}
            </div>
          )}

          {parseResult && (
            <>
              <div className="mt-6 flex flex-wrap gap-3">
                <StatPill label="Excel rows" value={stats.total} />
                <StatPill label="Valid rows" value={stats.valid} />
                <StatPill label="Invalid issues" value={stats.invalid} />
                <StatPill label="Existing" value={stats.existing} />
                <StatPill label="New products" value={stats.newProducts} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={checkProducts}
                  disabled={
                    checkingProducts ||
                    importing ||
                    parseResult.rows.length === 0 ||
                    parseResult.errors.length > 0
                  }
                  className="h-12 rounded-full bg-[#111713] px-6 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkingProducts ? "Checking…" : "Check Products"}
                </button>

               <button
  type="button"
  onClick={importRows}
  disabled={
    importing ||
    checkingProducts ||
    importResult !== null ||
    previewRows.length === 0 ||
    parseResult.errors.length > 0 ||
    previewRows.some((row) => row.status === "pending")
  }
  className="h-12 rounded-full bg-[#1db954] px-6 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
>
  {importing
    ? "Importing…"
    : importResult
      ? "Imported"
      : "Confirm Import"}
</button>

                <button
                  type="button"
                  onClick={resetImport}
                  disabled={importing}
                  className="h-12 rounded-full border border-[#e0e8e3] bg-white px-6 font-black text-[#111713]"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>

        {parseResult?.errors.length ? (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-red-200 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-red-50 p-5">
              <h2 className="text-xl font-black text-red-700">
                Validation Issues ({parseResult.errors.length})
              </h2>

              <p className="mt-1 text-sm font-semibold text-red-600">
                Correct these rows in Excel and upload the file again.
              </p>
            </div>

            <div className="max-h-[420px] overflow-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-xs font-black uppercase tracking-wide text-[#8aa59a]">
                    <th className="p-4">Excel row</th>
                    <th className="p-4">Problem</th>
                  </tr>
                </thead>

                <tbody>
                  {parseResult.errors.map((error, index) => (
                    <tr
                      key={`${error.rowNumber}-${index}`}
                      className="border-t border-[#eef2f0]"
                    >
                      <td className="p-4 font-black text-[#111713]">
                        {error.rowNumber}
                      </td>

                      <td className="p-4 font-semibold text-red-700">
                        {error.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {previewRows.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-[#e0e8e3] bg-white shadow-sm">
            <div className="border-b border-[#e0e8e3] p-5">
              <h2 className="text-xl font-black text-[#111713]">
                Import Preview ({previewRows.length})
              </h2>

              <p className="mt-1 text-sm font-semibold text-[#648770]">
                Review the data before confirming the import.
              </p>
            </div>

            <div className="max-h-[650px] overflow-auto">
              <table className="min-w-[1200px] w-full text-left">
                <thead className="sticky top-0 bg-[#f6f8f7]">
                  <tr className="text-xs font-black uppercase tracking-wide text-[#8aa59a]">
                    <th className="p-4">Row</th>
                    <th className="p-4">Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Origin</th>
                    <th className="p-4">Min</th>
                    <th className="p-4">Max</th>
                    <th className="p-4">Rate</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {previewRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className="border-t border-[#eef2f0]"
                    >
                      <td className="p-4 font-black text-[#111713]">
                        {row.rowNumber}
                      </td>

                      <td className="p-4">
                        <div className="font-black text-[#111713]">
                          {row.item}
                        </div>

                        {row.productSlug && (
                          <div className="mt-1 text-xs font-semibold text-[#8aa59a]">
                            {row.productSlug}
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-semibold text-[#111713]">
                        {row.category}
                      </td>

                      <td className="p-4 font-semibold text-[#111713]">
                        {row.origin}
                      </td>

                      <td className="p-4 font-black text-[#111713]">
                        AED {row.min.toFixed(2)}
                      </td>

                      <td className="p-4 font-black text-[#111713]">
                        AED {row.max.toFixed(2)}
                      </td>

                      <td className="p-4 font-black text-[#111713]">
                        AED {row.rate.toFixed(2)}
                      </td>

                      <td className="p-4 font-semibold text-[#111713]">
                        {row.date}
                      </td>

                      <td className="p-4 font-semibold text-[#111713]">
                        {row.time}
                      </td>

                      <td className="p-4">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {importResult && (
          <div className="mt-6 rounded-[28px] border border-[#cfe9d8] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-[#0f6b33]">
              Import Completed
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">
              <StatPill label="Updated" value={importResult.updated ?? 0} />
              <StatPill label="Created" value={importResult.created ?? 0} />
              <StatPill
                label="History rows"
                value={importResult.historyInserted ?? 0}
              />
              <StatPill
                label="Skipped duplicates"
                value={importResult.skipped ?? 0}
              />
              <StatPill label="Failed" value={importResult.failed ?? 0} />
            </div>

            {(importResult.errors?.length ?? 0) > 0 && (
              <div className="mt-5 rounded-[18px] border border-red-200 bg-red-50 p-4">
                {importResult.errors?.map((error, index) => (
                  <div
                    key={`${error.rowNumber}-${index}`}
                    className="font-semibold text-red-700"
                  >
                    Row {error.rowNumber}: {error.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-full border border-[#e0e8e3] bg-white px-4 py-2 shadow-sm">
      <div className="text-[10px] font-black uppercase leading-none text-[#8aa59a]">
        {label}
      </div>

      <div className="mt-1 text-sm font-black leading-none text-[#111713]">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PreviewStatus }) {
  const classes =
    status === "existing"
      ? "border-[#cfe9d8] bg-[#eaf7ef] text-[#0f6b33]"
      : status === "new"
        ? "border-[#ffe3b3] bg-[#fff7e6] text-[#8a5a00]"
        : status === "invalid"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-[#e0e8e3] bg-[#f6f8f7] text-[#648770]";

  const label =
    status === "existing"
      ? "Update"
      : status === "new"
        ? "Create"
        : status === "invalid"
          ? "Invalid"
          : "Not checked";

  return (
    <span
      className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-black ${classes}`}
    >
      {label}
    </span>
  );
}