"use client";

import { createContext, useState, type ReactNode} from "react";
import { type Product } from "@/data/products"

type WishlistContextType = {
    wishlist: Product[];

    addToWishlist: (product: Product) => void;

    removeFromWishlist: (product: Product) => void;

    wishlistCount: number;
};
export const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [wishlist, setWishlist] = useState<Product[]>(()=>{
        try{
            const savedWishlist = localStorage.getItem("wishlist");
            return (savedWishlist ? JSON.parse(savedWishlist):[])
        }catch{
            return [];
        }
    });

    const wishlistCount = wishlist.length;

    const addToWishlist = (product: Product) => {
        const existingItem = wishlist.find(
            (wishlistItem) => wishlistItem.id === product.id  
        );

        if(existingItem){
            return;
        }else{
        setWishlist([...wishlist, product]);
        }
    };

    const removeFromWishlist = (product: Product) => {
        const newArray = wishlist.filter(
            (item) => item.id !== product.id
        );

        setWishlist(newArray);
    };
    
    const value = {
            wishlist,
            addToWishlist,
            removeFromWishlist,
            wishlistCount
    }
       
        return (
            <WishlistContext.Provider value={value}>
                {children}
            </WishlistContext.Provider>
        );
}
