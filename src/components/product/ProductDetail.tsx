"use client";

import Image from "next/image";
import { useState } from "react";

import Button from "@/components/ui/Button";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types/Product";
import { toast } from "sonner";

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);

  return (
    <section className="mx-auto max-w-6xl p-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Left */}

        <div className="flex items-center justify-center rounded-xl bg-gray-100 p-6">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className="rounded-xl object-cover shadow-lg transition duration-300 hover:scale-105"
          />
        </div>

        {/* Right */}

        <div className="flex flex-col gap-5">
          <h1 className="text-4xl font-bold">{product.title}</h1>

          <p className="text-lg text-gray-500">{product.category}</p>

          <div className="flex items-center gap-2">
            <span className="text-lg text-yellow-500">★★★★★</span>

            <span className="text-sm text-gray-500">4.8 (120 Reviews)</span>
          </div>

          <p className="text-3xl font-bold text-blue-600">₹{product.price}</p>

          <span
            className={`
              w-fit
              rounded-full
              px-4
              py-2
              text-sm
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

          <p className="leading-7 text-gray-600">{product.description}</p>

          {/* Quantity */}

          <div className="mt-2 flex items-center gap-5">
            <span className="font-semibold">Quantity</span>

            <div className="flex items-center overflow-hidden rounded-lg border">
              <button
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  if (quantity > 1) {
                    setQuantity(quantity - 1);
                  }
                }}
              >
                −
              </button>

              <span className="px-5 font-semibold">{quantity}</span>

              <button
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}

          <div className="mt-6 flex gap-4">
            <Button
              text="🛒 Add To Cart"
              disabled={!product.inStock}
              onClick={() => {
                addToCart(product, quantity);
                toast.success("Added to Cart 🛒");
              }}
            />

            <Button
              text="❤️ Wishlist"
              onClick={() => {
                addToWishlist(product);
                toast.success("Added to Wishlist ❤️");
              }}
            />
          </div>

          {/* Delivery */}
          <div className="mt-8 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-800">
            <p className="flex items-center gap-2">
              <span>🚚</span>
              <span>Free Delivery</span>
            </p>

            <p className="flex items-center gap-2">
              <span>↩️</span>
              <span>7 Days Easy Return</span>
            </p>

            <p className="flex items-center gap-2">
              <span>🔒</span>
              <span>Secure Checkout</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
