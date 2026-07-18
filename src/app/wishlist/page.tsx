"use client"
import useWishlist from "@/hooks/useWishlist"
import WishlistProductCard from "@/components/product/WishlistProductCard"


export default function Cart() {
    const {wishlist} = useWishlist();

       return(
                <div className="grid grid-cols-1">
                 {wishlist.length > 0 ? (
                    <div>
                      {wishlist.map((wishlistItem) => (
                        <WishlistProductCard
                          key={wishlistItem.id}  
                          wishlistItem={wishlistItem}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">
                       No product in Wishlist.
                    </p>
                  )}
                   
                </div>
        )

}