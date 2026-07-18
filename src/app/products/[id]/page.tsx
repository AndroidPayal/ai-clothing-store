import ProductDetail from "@/components/product/ProductDetail";
import { products } from "@/data/products";


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);

  const product = products.find(
    (product) => product.id === productId
  );

  if (!product) {
    return <h1>Product Not Found</h1>;
  }

  return (
    <ProductDetail
      product = {product}    
    />
  );
}