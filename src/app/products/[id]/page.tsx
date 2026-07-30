import ProductDetail from "@/components/product/ProductDetail";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return <h1>Product Not Found</h1>;
  }

  const data = await response.json();

  return <ProductDetail product={data.product} />;
}
