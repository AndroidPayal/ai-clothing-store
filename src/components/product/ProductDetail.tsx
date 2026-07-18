"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { Product } from "@/data/products";
import useCart from "@/hooks/useCart";
import { useState } from "react";
type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({
  product,
}: ProductDetailProps) {

  const { addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

        {/* Left Side */}
        <div className="flex justify-center">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className="rounded-lg border object-cover"
          /> 
        </div>

        {/* Right Side */}
        <div className="flex flex-col gap-5">

          <h1 className="text-4xl font-bold">
            {product.title}
          </h1>

          <p className="text-3xl font-semibold text-blue-600">
            ₹{product.price}
          </p>

          <p
            className={`font-medium ${
              product.inStock
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {product.inStock
              ? "✅ In Stock"
              : "❌ Out of Stock"}
          </p>


            <div className="flex items-center gap-3">
                <button className="
                    w-8
                    h-8
                    rounded
                    border
                    flex
                    items-center
                    justify-center
                    hover:bg-gray-100
                    cursor-pointer
                    "
                    onClick={()=> {if(quantity>1){setQuantity(quantity-1)}}}
                >-</button>

                <span>{quantity}</span>

                <button className="
                    w-8
                    h-8
                    rounded
                    border
                    flex
                    items-center
                    justify-center
                    hover:bg-gray-100
                    cursor-pointer
                    "
                    onClick={()=> setQuantity(quantity+1)}
                >+</button>
            </div>

          <div className="w-48">
            <Button
              text="Add To Cart"
              onClick={() => addToCart(product, quantity)}
            />
          </div>

        </div>

      </div>
    </div>
  );
}