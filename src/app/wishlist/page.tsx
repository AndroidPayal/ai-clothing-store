"use client"
import useWishlist from "@/hooks/useWishlist"
import WishlistProductCard from "@/components/product/WishlistProductCard"
import EmptyState from "@/components/common/EmptyState";


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
                    <EmptyState
                      emoji="❤️"
                      title="Wishlist is Empty"
                      description="Save products you love for later."
                      buttonText="Browse Products"
                      href="/"
                    />
                  )}
                   
                </div>
        )

}