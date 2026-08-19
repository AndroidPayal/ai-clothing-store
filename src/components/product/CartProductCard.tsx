"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Minus, Plus, Trash2 } from "lucide-react";

import { CartItem } from "@/types/Product";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";

type CartProductCardProps = {
  cartItem: CartItem;
};

export default function CartProductCard({ cartItem }: CartProductCardProps) {
  const { removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const { addToWishlist } = useWishlist();

  const { product, quantity } = cartItem;

  return (
    <article className="grid gap-5 border-b border-kora py-8 sm:grid-cols-[140px_1fr]">
      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-kora"
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="140px"
          className="object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      </Link>

      {/* Information */}
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-utility text-[8px] tracking-[0.18em] text-awadh-ink">
              {product.category.toUpperCase()}
            </p>

            <Link href={`/products/${product.id}`}>
              <h3 className="mt-3 font-display text-2xl leading-tight text-thread-black transition-colors hover:text-awadh-ink">
                {product.title}
              </h3>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(cartItem)}
            aria-label={`Remove ${product.title} from cart`}
            className="shrink-0 text-thread-grey transition-colors hover:text-thread-black"
          >
            <Trash2 size={17} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="font-editorial text-lg text-thread-black">
            ₹ {product.price.toLocaleString("en-IN")}
          </span>

          <span className="font-editorial text-lg text-thread-black">
            ₹ {(product.price * quantity).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Quantity */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="mb-2 font-utility text-[8px] tracking-[0.16em] text-thread-grey">
              QUANTITY
            </p>

            <div className="flex items-center border border-thread-black">
              <button
                type="button"
                onClick={() => decreaseQuantity(cartItem)}
                disabled={quantity <= 1}
                className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-thread-black hover:text-muslin disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus size={14} strokeWidth={1.5} />
              </button>

              <span className="flex h-9 w-10 items-center justify-center border-x border-thread-black font-utility text-[9px]">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => increaseQuantity(cartItem)}
                className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-thread-black hover:text-muslin"
              >
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={() => {
              removeFromCart(cartItem);
              addToWishlist(product);
            }}
            className="flex items-center gap-2 font-utility text-[8px] tracking-[0.16em] text-thread-grey transition-colors hover:text-awadh-ink"
          >
            <Heart size={15} strokeWidth={1.5} />
            MOVE TO WISHLIST
          </button>
        </div>
      </div>
    </article>
  );
}
