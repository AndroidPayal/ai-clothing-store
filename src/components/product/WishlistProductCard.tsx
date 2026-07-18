"use client"
import { Product } from "@/data/products"
import Link from "next/link"
import Button from "../ui/Button";
import useWishlist from "@/hooks/useWishlist";
import Image from "next/image";
import useCart from "@/hooks/useCart";

type WishlistProductCard = {
    wishlistItem : Product
};

export default function WishlistProductCard({
    wishlistItem
} : WishlistProductCard){

    const {removeFromWishlist} = useWishlist();
    const { addToCart } = useCart();

    return(
          <div className="rounded-lg border p-4 shadow-md hover:shadow-xl transition">
            <Link href={`/products/${wishlistItem.id}`}>
            <Image
                src={wishlistItem.thumbnail}
                alt={wishlistItem.title}
                width={250}
                height={250}
                className="rounded-lg object-cover"
            />
                <h3 className="text-xl font-bold hover:text-blue-600">
                { wishlistItem.title }
                </h3>
            </Link>

            <p className="text-2xl
                  font-semibold
                text-blue-600">
                ₹{ wishlistItem.price }
            </p>

            <div className="mt-5 space-y-3">
                <Button
                    text="🛒 Add to Cart"
                    onClick={() => {
                        addToCart(wishlistItem);
                        removeFromWishlist(wishlistItem)
                    }}
                />
                <Button 
                    text="❌ Remove" 
                    onClick={() => removeFromWishlist(wishlistItem)}
                />
            </div>


        </div>
    )

}