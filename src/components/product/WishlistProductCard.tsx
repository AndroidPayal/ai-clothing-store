"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Product } from "@/types/Product";
import useWishlist from "@/hooks/useWishlist";
import useCart from "@/hooks/useCart";

type WishlistProductCardProps = {
  wishlistItem: Product;
};

export default function WishlistProductCard({
  wishlistItem,
}: WishlistProductCardProps) {
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(wishlistItem);
    removeFromWishlist(wishlistItem);
    toast.success("Added to Bag");
  };

  const handleRemove = () => {
    removeFromWishlist(wishlistItem);
    toast.success("Removed from Wishlist");
  };

  return (
    <article className="group">
      {/* Product image */}
      <div className="relative overflow-hidden bg-kora">
        <Link href={`/products/${wishlistItem.id}`}>
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Image
              src={wishlistItem.thumbnail}
              alt={wishlistItem.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        {/* Wishlist indicator */}
        <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-muslin/60 bg-muslin/80 text-awadh-ink backdrop-blur-sm">
          <Heart size={17} fill="currentColor" strokeWidth={1.5} />
        </div>
      </div>

      {/* Product information */}
      <div className="border-x border-b border-kora p-5 sm:p-6">
        <Link href={`/products/${wishlistItem.id}`} className="block">
          <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
            {wishlistItem.category.toUpperCase()}
          </p>

          {/* Fixed title area */}
          <h3 className="mt-3 min-h-[3.5rem] font-display text-2xl leading-tight text-thread-black transition-colors group-hover:text-awadh-ink">
            {wishlistItem.title}
          </h3>

          <p className="mt-3 font-editorial text-lg text-thread-black">
            ₹ {wishlistItem.price.toLocaleString("en-IN")}
          </p>
        </Link>

        {/* Specification */}
        <div className="mt-6 border-t border-kora pt-4">
          <p className="font-utility text-[8px] tracking-[0.14em] text-thread-grey">
            SAVED TO WISHLIST
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!wishlistItem.inStock}
            className="
              group/button
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
            <span>
              {wishlistItem.inStock ? "ADD TO BAG" : "UNAVAILABLE"}
            </span>

            <Plus
              size={16}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover/button:rotate-90"
            />
          </button>

          <button
            type="button"
            onClick={handleRemove}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              py-2
              font-utility
              text-[8px]
              tracking-[0.16em]
              text-thread-grey
              transition-colors
              hover:text-thread-black
            "
          >
            <X size={13} strokeWidth={1.5} />
            REMOVE FROM WISHLIST
          </button>
        </div>
      </div>
    </article>
  );
}