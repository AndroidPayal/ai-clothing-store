"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, Minus, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "@/components/product/ProductCard";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types/Product";

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) return;

        const data = await response.json();

        const related = data.products
          .filter(
            (item: Product) =>
              item.id !== product.id &&
              item.category.toLowerCase() === product.category.toLowerCase(),
          )
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (error) {
        console.error("Related products fetch error:", error);
      }
    };

    fetchRelatedProducts();
  }, [product.id, product.category]);

  return (
    <main className="min-h-screen bg-muslin">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1440px] px-6 pt-8 sm:px-10 lg:px-16">
        <Link
          href="/products"
          className="inline-flex items-center gap-3 font-utility text-[9px] tracking-[0.2em] text-thread-grey transition-colors hover:text-thread-black"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          BACK TO COLLECTION
        </Link>
      </div>

      <section className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* PRODUCT IMAGE */}
          <div>
            <div className="relative overflow-hidden bg-kora">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>

              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-thread-black/40">
                  <span className="font-utility text-[10px] tracking-[0.2em] text-muslin">
                    CURRENTLY UNAVAILABLE
                  </span>
                </div>
              )}
            </div>

            {/* Image note */}
            <div className="flex items-center justify-between border-x border-b border-kora px-4 py-3">
              <span className="font-utility text-[8px] tracking-[0.18em] text-thread-grey">
                SOZAN / NAZM
              </span>

              <span className="font-utility text-[8px] tracking-[0.18em] text-thread-grey">
                OBJECT 01
              </span>
            </div>
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="flex flex-col lg:pt-6">
            {/* Category */}
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-awadh-ink" />

              <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                {product.category.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-8 max-w-xl font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
              {product.title}
            </h1>

            {/* Price */}
            <p className="mt-8 font-editorial text-2xl text-thread-black">
              ₹ {product.price.toLocaleString("en-IN")}
            </p>

            {/* Availability */}
            <div className="mt-6 border-y border-kora py-4">
              <span
                className={`font-utility text-[9px] tracking-[0.18em] ${
                  product.inStock ? "text-thread-black" : "text-thread-grey"
                }`}
              >
                {product.inStock
                  ? "AVAILABLE / READY TO SHIP"
                  : "CURRENTLY UNAVAILABLE"}
              </span>
            </div>

            {/* Description */}
            <div className="mt-8">
              <p className="max-w-xl font-editorial text-lg leading-relaxed text-thread-grey">
                {product.description}
              </p>
            </div>

            {/* Quantity */}
            <div className="mt-10">
              <p className="mb-3 font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                QUANTITY
              </p>

              <div className="flex w-fit items-center border border-thread-black">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-thread-black hover:text-muslin disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={15} strokeWidth={1.5} />
                </button>

                <span className="flex h-11 w-12 items-center justify-center border-x border-thread-black font-utility text-[10px]">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-thread-black hover:text-muslin"
                >
                  <Plus size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => {
                  addToCart(product, quantity);
                  toast.success("Added to Bag");
                }}
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  border
                  border-thread-black
                  bg-thread-black
                  px-6
                  py-4
                  font-utility
                  text-[9px]
                  tracking-[0.2em]
                  text-muslin
                  transition-colors
                  hover:bg-transparent
                  hover:text-thread-black
                  disabled:cursor-not-allowed
                  disabled:border-thread-grey
                  disabled:bg-thread-grey
                "
              >
                {product.inStock ? "ADD TO BAG" : "UNAVAILABLE"}
              </button>

              <button
                type="button"
                onClick={() => {
                  addToWishlist(product);
                  toast.success("Added to Wishlist");
                }}
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  border
                  border-thread-black
                  px-6
                  py-4
                  font-utility
                  text-[9px]
                  tracking-[0.2em]
                  text-thread-black
                  transition-colors
                  hover:bg-thread-black
                  hover:text-muslin
                "
              >
                <Heart size={16} strokeWidth={1.5} />
                WISHLIST
              </button>
            </div>

            {/* Product promises */}
            <div className="mt-10 border-t border-kora">
              <div className="flex items-center justify-between border-b border-kora py-5">
                <span className="font-utility text-[9px] tracking-[0.16em] text-thread-grey">
                  DELIVERY
                </span>

                <span className="font-editorial text-base text-thread-black">
                  Free delivery
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-kora py-5">
                <span className="font-utility text-[9px] tracking-[0.16em] text-thread-grey">
                  RETURNS
                </span>

                <span className="font-editorial text-base text-thread-black">
                  7 days easy return
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-kora py-5">
                <span className="font-utility text-[9px] tracking-[0.16em] text-thread-grey">
                  CHECKOUT
                </span>

                <span className="font-editorial text-base text-thread-black">
                  Secure checkout
                </span>
              </div>
            </div>

            {/* Closing statement */}
            <p className="mt-10 max-w-md font-editorial text-base italic leading-relaxed text-thread-grey">
              A considered piece, chosen to become part of your story.
            </p>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-kora bg-muslin px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col justify-between gap-6 border-b border-kora pb-8 sm:flex-row sm:items-end">
              <div>
                <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                  CONTINUE EXPLORING
                </p>

                <h2 className="mt-5 font-display text-4xl leading-none text-thread-black sm:text-5xl">
                  You may also like.
                </h2>
              </div>

              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink"
              >
                VIEW ALL {product.category.toUpperCase()} →
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  addToCart={addToCart}
                  addToWishlist={addToWishlist}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
