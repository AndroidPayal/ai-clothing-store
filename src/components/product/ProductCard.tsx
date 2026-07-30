"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import Button from "../ui/Button";
import { Product } from "@/types/Product";

type ProductCardProps = {
  product: Product;
  addToCart: (product: Product) => void;
  addToWishlist: (product: Product) => void;
};

export default function ProductCard({
  product,
  addToCart,
  addToWishlist,
}: ProductCardProps) {
  return (
    <div
      className="
        group
        w-72
        overflow-hidden
        rounded-xl
        border
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <Link href={`/products/${product.id}`}>
        <div className="overflow-hidden rounded-lg">
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={260}
            height={260}
            className="
              h-64
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-105
            "
          />
        </div>

        <div className="mt-4">
          <h3
            className="
              text-xl
              font-bold
              transition
              group-hover:text-blue-600
            "
          >
            {product.title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">{product.category}</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-yellow-500">★★★★★</span>

            <span className="text-sm text-gray-500">(4.8)</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-2xl font-bold text-blue-600">₹{product.price}</p>

            <span
              className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${
                  product.inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              `}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-5 space-y-3">
        <Button
          text="🛒 Add To Cart"
          disabled={!product.inStock}
          onClick={() => {
            addToCart(product);
            toast.success("Added to Cart 🛒");
          }}
        />

        <Button
          text="❤️ Add To Wishlist"
          onClick={() => {
            addToWishlist(product);
            toast.success("Added to Wishlist ❤️");
          }}
        />
      </div>
    </div>
  );
}
