import CategoryClient from "@/components/CategoryClient";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params; // ✅ FIX for Next 16
  return <CategoryClient category={category} />;
}
