"use client"
import {CartItem} from "@/data/products"
import Link from "next/link"
import Button from "../ui/Button";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";

type CartProductCard = {
    cartItem : CartItem
};

export default function CartProductCard({
    cartItem
} : CartProductCard){
    const {removeFromCart, increaseQuantity, decreaseQuantity} = useCart();
    const{addToWishlist} = useWishlist();

    return(
        <div className="rounded-lg border p-4 shadow-md hover:shadow-xl transition">
            <Link href={`/products/${cartItem.product.id}`}>
                <h3 className="text-xl font-bold hover:text-blue-600">
                {cartItem.product.title}
                </h3>
            </Link>

            <p className="mt-2 text-gray-600">
                ₹{cartItem.product.price * cartItem.quantity}
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
                    onClick={()=> decreaseQuantity(cartItem)}
                >-</button>

                <span>{cartItem.quantity}</span>

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
                    onClick={()=> increaseQuantity(cartItem)}
                >+</button>
            </div>


            <div className="mt-5 space-y-3">
                <Button
                    text="🤍 Move to Wishlist"
                    onClick={() => {
                        removeFromCart(cartItem);
                        addToWishlist(cartItem.product);
                    }}
                />
                <Button 
                    text="❌ Remove From Cart" 
                    onClick={() => removeFromCart(cartItem)}
                />
            </div>

        </div>
    )
}