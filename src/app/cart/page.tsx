"use client"
import useCart from "@/hooks/useCart"
import CartProductCard from "@/components/product/CartProductCard"
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Cart() {
    const {cart, cartTotal} = useCart();

    return(
            <div className="grid grid-cols-1">
             {cart.length > 0 ? (
                <div>
                  {cart.map((cartItem) => (
                    <CartProductCard
                      key={cartItem.product.id}  
                      cartItem={cartItem}
                    />
                  ))}
                  <div >
                    <div className="m-5">
                      <h1>Total: </h1>
                      {cartTotal}
                    </div>

                    <Link href="/checkout">
                        <Button text="Proceed to Checkout" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                   No product in Cart.
                </p>
              )}
               
            </div>
    )
}
