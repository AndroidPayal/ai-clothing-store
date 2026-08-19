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
  return (
    <article className="group flex h-full flex-col">
      {/* Product image */}
      <div className="relative overflow-hidden bg-kora">
        <Link href={`/products/${product.id}`}>
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.03]
              "
            />
            <div
              className="
    pointer-events-none
    absolute
    inset-x-0
    bottom-0
    flex
    justify-center
    pb-5
    opacity-0
    transition-opacity
    duration-500
    group-hover:opacity-100
  "
            >
              <span
                className="
                  bg-muslin/90
                  px-5
                  py-2.5
                  font-utility
                  text-[9px]
                  tracking-[0.18em]
                  text-thread-black
                  backdrop-blur-sm
                "
              >
                VIEW PIECE
              </span>
            </div>
          </div>
        </Link>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => {
            addToWishlist(product);
            toast.success("Added to Wishlist");
          }}
          aria-label={`Add ${product.title} to wishlist`}
          className="
            absolute
            right-4
            top-4
            flex
            h-9
            w-9
            items-center
            justify-center
            border
            border-muslin/60
            bg-muslin/80
            text-thread-black
            backdrop-blur-sm
            transition
            hover:bg-thread-black
            hover:text-muslin
          "
        >
          <Heart size={17} strokeWidth={1.5} />
        </button>

        {/* Out of stock */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-thread-black/40">
            <span className="font-utility text-[10px] tracking-[0.2em] text-muslin">
              CURRENTLY UNAVAILABLE
            </span>
          </div>
        )}
      </div>

      {/* Product information */}
      <div className="flex flex-1 flex-col border-x border-b border-kora p-5 sm:p-6">
        {" "}
        <Link href={`/products/${product.id}`} className="block">
          <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
            {product.category.toUpperCase()}
          </p>

          <h3 className="mt-3 min-h-[3.5rem] font-display text-2xl leading-tight text-thread-black transition-colors group-hover:text-awadh-ink">
            {product.title}
          </h3>

          <p className="mt-3 font-editorial text-lg text-thread-black">
            ₹ {product.price.toLocaleString("en-IN")}
          </p>
        </Link>
        {/* Product specification */}
        <div className="mt-auto border-t border-kora pt-4">
          <p className="font-utility text-[8px] tracking-[0.14em] text-thread-grey">
            FABRIC · CRAFTED WITH CARE
          </p>
        </div>
        {/* Add to bag */}
        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => {
            addToCart(product);
            toast.success("Added to Bag");
          }}
          className="
            group/button
            mt-6
            flex
            w-full
            items-center
            justify-between
            border
            border-thread-black
            px-4
            py-3
            font-utility
            text-[9px]
            tracking-[0.18em]
            text-thread-black
            transition
            hover:bg-thread-black
            hover:text-muslin
            disabled:cursor-not-allowed
            disabled:border-thread-grey
            disabled:text-thread-grey
            disabled:hover:bg-transparent
          "
        >
          <span>{product.inStock ? "ADD TO BAG" : "UNAVAILABLE"}</span>

          <Plus
            size={16}
            strokeWidth={1.5}
            className="transition-transform duration-300 group-hover/button:rotate-90"
          />
        </button>
      </div>
    </article>
  );
}
