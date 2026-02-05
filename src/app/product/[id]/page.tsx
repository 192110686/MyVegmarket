import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params; // ✅ Next 16
  const sp = (await searchParams) ?? {};
  const isAlAweerLite = sp.from === "alAweer";

  return <ProductDetailClient id={id} isAlAweerLite={isAlAweerLite} />;
}
