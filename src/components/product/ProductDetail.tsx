"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  const MAX_QUANTITY = 10;

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setIsLoadingRelated(true);

        const response = await fetch("/api/products");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!Array.isArray(data.products)) {
          return;
        }

        const related = data.products
          .filter(
            (item: Product) =>
              item.id !== product.id &&
              item.category?.toLowerCase() === product.category?.toLowerCase(),
          )
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (error) {
        console.error("Related products fetch error:", error);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product.id, product.category]);

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(MAX_QUANTITY, current + 1));
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;

    addToCart(product, quantity);
    toast.success(
      quantity > 1 ? `${quantity} items added to Bag` : "Added to Bag",
    );
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
    toast.success("Added to Wishlist");
  };

  return (
    <main className="min-h-screen bg-muslin">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1440px] px-5 pt-6 sm:px-8 sm:pt-8 lg:px-16">
        <Link
          href="/products"
          className="
            inline-flex
            min-h-10
            items-center
            gap-3
            font-utility
            text-[8px]
            tracking-[0.2em]
            text-thread-grey
            transition-colors
            hover:text-thread-black
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-awadh-terracotta
            focus-visible:ring-offset-2
            sm:text-[9px]
          "
        >
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
          BACK TO COLLECTION
        </Link>
      </div>

      {/* Main Product */}
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 xl:gap-20">
          {/* PRODUCT IMAGE */}
          <div>
            <div className="relative overflow-hidden bg-kora">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
                />
              </div>

              {/* Out of Stock */}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-thread-black/45">
                  <span className="px-5 text-center font-utility text-[9px] tracking-[0.18em] text-muslin sm:text-[10px] sm:tracking-[0.2em]">
                    CURRENTLY UNAVAILABLE
                  </span>
                </div>
              )}
            </div>

            {/* Image Note */}
            <div className="flex items-center justify-between border-x border-b border-kora px-4 py-3">
              <span className="font-utility text-[7px] tracking-[0.18em] text-thread-grey sm:text-[8px]">
                SOZAN / NAZM
              </span>

              <span className="font-utility text-[7px] tracking-[0.18em] text-thread-grey sm:text-[8px]">
                OBJECT 01
              </span>
            </div>
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="flex flex-col lg:pt-4 xl:pt-6">
            {/* Category */}
            <div className="flex items-center gap-3 sm:gap-4">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-awadh-ink sm:w-10"
              />

              <span className="font-utility text-[8px] tracking-[0.2em] text-awadh-ink sm:text-[9px] sm:tracking-[0.22em]">
                {product.category.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-6 max-w-xl font-display text-[2.8rem] leading-[0.94] tracking-tight text-thread-black sm:mt-8 sm:text-6xl lg:text-7xl">
              {product.title}
            </h1>

            {/* Price */}
            <p className="mt-6 font-editorial text-xl text-thread-black sm:mt-8 sm:text-2xl">
              ₹ {product.price.toLocaleString("en-IN")}
            </p>

            {/* Availability */}
            <div className="mt-5 border-y border-kora py-4 sm:mt-6">
              <span
                className={`font-utility text-[8px] tracking-[0.18em] sm:text-[9px] ${
                  product.inStock ? "text-thread-black" : "text-thread-grey"
                }`}
              >
                {product.inStock
                  ? "AVAILABLE / READY TO SHIP"
                  : "CURRENTLY UNAVAILABLE"}
              </span>
            </div>

            {/* Description */}
            <div className="mt-7 sm:mt-8">
              <p className="max-w-xl font-editorial text-base leading-relaxed text-thread-grey sm:text-lg">
                {product.description}
              </p>
            </div>

            {/* Quantity */}
            {product.inStock && (
              <div className="mt-8 sm:mt-10">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-utility text-[8px] tracking-[0.18em] text-thread-grey sm:text-[9px]">
                    QUANTITY
                  </p>

                  <p className="font-utility text-[7px] tracking-[0.14em] text-thread-grey sm:text-[8px]">
                    MAX {MAX_QUANTITY}
                  </p>
                </div>

                <div className="flex w-fit items-center border border-thread-black">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={decreaseQuantity}
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      transition-colors
                      hover:bg-thread-black
                      hover:text-muslin
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-awadh-terracotta
                      focus-visible:ring-inset
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Minus size={15} strokeWidth={1.5} aria-hidden="true" />
                  </button>

                  <span
                    aria-live="polite"
                    className="flex h-11 w-12 items-center justify-center border-x border-thread-black font-utility text-[10px]"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= MAX_QUANTITY}
                    onClick={increaseQuantity}
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      transition-colors
                      hover:bg-thread-black
                      hover:text-muslin
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-awadh-terracotta
                      focus-visible:ring-inset
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Plus size={15} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className="
                  flex
                  min-h-12
                  flex-1
                  items-center
                  justify-center
                  border
                  border-thread-black
                  bg-thread-black
                  px-6
                  py-4
                  font-utility
                  text-[8px]
                  tracking-[0.2em]
                  text-muslin
                  transition-colors
                  hover:bg-transparent
                  hover:text-thread-black
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-awadh-terracotta
                  focus-visible:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:border-thread-grey
                  disabled:bg-thread-grey
                "
              >
                {product.inStock ? "ADD TO BAG" : "UNAVAILABLE"}
              </button>

              <button
                type="button"
                onClick={handleAddToWishlist}
                className="
                  flex
                  min-h-12
                  items-center
                  justify-center
                  gap-3
                  border
                  border-thread-black
                  px-6
                  py-4
                  font-utility
                  text-[8px]
                  tracking-[0.2em]
                  text-thread-black
                  transition-colors
                  hover:bg-thread-black
                  hover:text-muslin
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-awadh-terracotta
                  focus-visible:ring-offset-2
                  sm:text-[9px]
                "
              >
                <Heart size={16} strokeWidth={1.5} aria-hidden="true" />
                WISHLIST
              </button>
            </div>

            {/* Product Promises */}
            <div className="mt-8 border-t border-kora sm:mt-10">
              <div className="flex items-center justify-between gap-6 border-b border-kora py-4 sm:py-5">
                <span className="font-utility text-[8px] tracking-[0.16em] text-thread-grey sm:text-[9px]">
                  DELIVERY
                </span>

                <span className="text-right font-editorial text-sm text-thread-black sm:text-base">
                  Free delivery
                </span>
              </div>

              <div className="flex items-center justify-between gap-6 border-b border-kora py-4 sm:py-5">
                <span className="font-utility text-[8px] tracking-[0.16em] text-thread-grey sm:text-[9px]">
                  RETURNS
                </span>

                <span className="text-right font-editorial text-sm text-thread-black sm:text-base">
                  7 days easy return
                </span>
              </div>

              <div className="flex items-center justify-between gap-6 border-b border-kora py-4 sm:py-5">
                <span className="font-utility text-[8px] tracking-[0.16em] text-thread-grey sm:text-[9px]">
                  CHECKOUT
                </span>

                <span className="text-right font-editorial text-sm text-thread-black sm:text-base">
                  Secure checkout
                </span>
              </div>
            </div>

            {/* Closing Statement */}
            <p className="mt-8 max-w-md font-editorial text-sm italic leading-relaxed text-thread-grey sm:mt-10 sm:text-base">
              A considered piece, chosen to become part of your story.
            </p>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {!isLoadingRelated && relatedProducts.length > 0 && (
        <section className="border-t border-kora bg-muslin px-5 py-16 sm:px-8 sm:py-20 lg:px-16 lg:py-28">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col gap-6 border-b border-kora pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-utility text-[8px] tracking-[0.2em] text-awadh-ink sm:text-[9px] sm:tracking-[0.22em]">
                  CONTINUE EXPLORING
                </p>

                <h2 className="mt-4 font-display text-4xl leading-none text-thread-black sm:mt-5 sm:text-5xl">
                  You may also like.
                </h2>
              </div>

              <Link
                href={`/products?category=${encodeURIComponent(
                  product.category,
                )}`}
                className="
                  self-start
                  font-utility
                  text-[8px]
                  tracking-[0.18em]
                  text-thread-black
                  transition-colors
                  hover:text-awadh-ink
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-awadh-terracotta
                  focus-visible:ring-offset-2
                  sm:self-auto
                  sm:text-[9px]
                "
              >
                VIEW ALL {product.category.toUpperCase()} →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:mt-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4">
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
