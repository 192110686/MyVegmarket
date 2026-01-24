import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ FIX for Next 16
  return <ProductDetailClient id={id} />;
}
