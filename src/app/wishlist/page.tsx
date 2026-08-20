"use client";

import useWishlist from "@/hooks/useWishlist";
import WishlistProductCard from "@/components/product/WishlistProductCard";
import EmptyState from "@/components/common/EmptyState";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <main className="min-h-screen bg-muslin px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="border-b border-kora pb-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                YOUR STORY — WISHLIST
              </p>

              <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
                Pieces worth
                <br />
                remembering.
              </h1>
            </div>

            {wishlist.length > 0 && (
              <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                {wishlist.length} {wishlist.length === 1 ? "PIECE" : "PIECES"}{" "}
                SAVED
              </p>
            )}
          </div>
        </div>

        {/* Wishlist */}
        {wishlist.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((wishlistItem) => (
              <WishlistProductCard
                key={wishlistItem.id}
                wishlistItem={wishlistItem}
              />
            ))}
          </div>
        ) : (
          <div className="py-20">
            <EmptyState
              emoji="♡"
              title="Nothing Saved Yet"
              description="Keep the pieces that speak to you close at hand."
              buttonText="EXPLORE THE COLLECTION"
              href="/products"
            />
          </div>
        )}
      </div>
    </main>
  );
}
