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
  const isNewArrivals =
    params.sort === "newest" || params.collection === "new-arrivals";

  return (
    <main>
      <ProductCollection
        initialCategory={params.category?.toLowerCase() || "All"}
        initialCollection={isNewArrivals ? "new-arrivals" : ""}
        initialSort={isNewArrivals ? "newest" : "default"}
        variant="shop"
      />
    </main>
  );
}
