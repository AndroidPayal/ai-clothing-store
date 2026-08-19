import ProductCollection from "@/components/product/ProductCollection";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    collection?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  return (
    <main>
      <ProductCollection
        initialCategory={params.category || "All"}
        initialCollection={params.collection || ""}
        variant="shop"
      />
    </main>
  );
}
