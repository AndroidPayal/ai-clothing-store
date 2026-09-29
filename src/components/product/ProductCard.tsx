"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";

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
  const productHref = `/products/${product.id}`;

  const handleWishlist = () => {
    addToWishlist(product);
    toast.success("Added to Wishlist");
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;

    addToCart(product);
    toast.success("Added to Bag");
  };

  return (
    <article className="group flex h-full flex-col">
      {/* Product Image */}
      <div className="relative overflow-hidden bg-kora">
        <Link
          href={productHref}
          aria-label={`View ${product.title}`}
          className="block"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            {/* Image Overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-thread-black/0 transition-colors duration-500 group-hover:bg-thread-black/10"
            />

            {/* Desktop View Piece */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden justify-center pb-5 sm:flex">
              <span className="translate-y-2 bg-muslin/90 px-5 py-2.5 font-utility text-[9px] tracking-[0.18em] text-thread-black opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                VIEW PIECE
              </span>
            </div>
          </div>
        </Link>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={`Add ${product.title} to wishlist`}
          className="
            absolute
            right-3
            top-3
            flex
            h-10
            w-10
            items-center
            justify-center
            border
            border-muslin/70
            bg-muslin/85
            text-thread-black
            backdrop-blur-sm
            transition-all
            duration-300
            hover:bg-thread-black
            hover:text-muslin
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-awadh-terracotta
            focus-visible:ring-offset-2
            sm:right-4
            sm:top-4
          "
        >
          <Heart
            size={17}
            strokeWidth={1.5}
            className="transition-transform duration-300 hover:scale-110"
          />
        </button>

        {/* Out of Stock */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-thread-black/45">
            <span className="px-4 text-center font-utility text-[9px] tracking-[0.18em] text-muslin sm:text-[10px] sm:tracking-[0.2em]">
              CURRENTLY UNAVAILABLE
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col border-x border-b border-kora p-4 sm:p-5 lg:p-6">
        <Link href={productHref} className="block focus-visible:outline-none">
          {/* Category */}
          <p className="font-utility text-[8px] tracking-[0.18em] text-thread-grey sm:text-[9px]">
            {product.category.toUpperCase()}
          </p>

          {/* Title */}
          <h3 className="mt-3 min-h-[3.2rem] font-display text-xl leading-tight text-thread-black transition-colors duration-300 group-hover:text-awadh-ink sm:text-2xl">
            {product.title}
          </h3>

          {/* Price */}
          <p className="mt-3 font-editorial text-base text-thread-black sm:text-lg">
            ₹ {product.price.toLocaleString("en-IN")}
          </p>
        </Link>

        {/* Product Specification */}
        <div className="mt-auto border-t border-kora pt-4">
          <p className="font-utility text-[7px] tracking-[0.14em] text-thread-grey sm:text-[8px]">
            FABRIC · CRAFTED WITH CARE
          </p>
        </div>

        {/* Add to Bag */}
        <button
          type="button"
          disabled={!product.inStock}
          onClick={handleAddToCart}
          aria-label={
            product.inStock
              ? `Add ${product.title} to bag`
              : `${product.title} is unavailable`
          }
          className="
            group/button
            mt-5
            flex
            min-h-11
            w-full
            items-center
            justify-between
            border
            border-thread-black
            px-4
            py-3
            font-utility
            text-[8px]
            tracking-[0.18em]
            text-thread-black
            transition-all
            duration-300
            hover:bg-thread-black
            hover:text-muslin
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-awadh-terracotta
            focus-visible:ring-offset-2
            disabled:cursor-not-allowed
            disabled:border-thread-grey
            disabled:text-thread-grey
            disabled:hover:bg-transparent
            sm:mt-6
            sm:text-[9px]
          "
        >
          <span>{product.inStock ? "ADD TO BAG" : "UNAVAILABLE"}</span>

          <Plus
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover/button:rotate-90"
          />
        </button>
      </div>
    </article>
  );
}
