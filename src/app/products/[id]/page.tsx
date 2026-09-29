import { notFound } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id || id.trim().length === 0) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not configured");
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/products/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();

  if (!data?.product) {
    notFound();
  }

  return <ProductDetail product={data.product} />;
}
