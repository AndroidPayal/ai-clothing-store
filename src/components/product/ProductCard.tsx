"use client"
import {Product} from "@/data/products"
import Link from "next/link"
import Button from "../ui/Button";
import Image from "next/image";

type ProductCardProps = {
  product: Product;
  addToCart: (product: Product) => void;
  addToWishlist: (product: Product) => void;
};

export default function ProductCard({
  product,
  addToCart,
  addToWishlist
}: ProductCardProps) {
  return (
 <div className="rounded-lg border p-4 shadow-md hover:shadow-xl transition w-64">

  <Link href={`/products/${product.id}`}>
    <div className="flex justify-center mb-4">
      <Image
        src={product.thumbnail}
        alt={product.title}
        width={220}
        height={220}
        className="rounded-lg object-cover"
      />
    </div>
    <h3 className="text-xl font-bold hover:text-blue-600">
      {product.title}
    </h3>
  </Link>

  <p className="mt-2 text-gray-600">
    ₹{product.price}
  </p>

  {/* Stock */}
  <div className=" space-y-3">
    <Button 
      text="Add to Cart" 
      onClick={() => {
          addToCart(product);
        }}
      
    />
      <Button 
      text="Add to Wishlist" 
      onClick={() => {
          addToWishlist(product);
        }}
      
    />
  </div>


</div>
  );
}