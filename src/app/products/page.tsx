import ProductCollection from "@/components/product/ProductCollection";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const category = params.category?.trim().toLowerCase() || "All";

  const isNewArrivals =
    params.sort === "newest" || params.collection === "new-arrivals";

  return (
    <main className="min-h-screen bg-muslin">
      <ProductCollection
        initialCategory={category}
        initialCollection={isNewArrivals ? "new-arrivals" : ""}
        initialSort={isNewArrivals ? "newest" : "default"}
        variant="shop"
      />
    </main>
  );
}
