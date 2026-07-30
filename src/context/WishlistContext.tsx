"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { type Product } from "@/types/Product";

type WishlistContextType = {
  wishlist: Product[];

  addToWishlist: (product: Product) => void;

  removeFromWishlist: (product: Product) => void;

  wishlistCount: number;
};

export const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();

  const [wishlist, setWishlist] = useState<Product[]>([]);

  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    const loadWishlist = async () => {
      try {
        setIsWishlistLoading(true);

        // Logged-in user
        if (status === "authenticated") {
          // Get guest wishlist before loading MongoDB wishlist
          const savedGuestWishlist = localStorage.getItem("wishlist");

          const guestWishlist: Product[] = savedGuestWishlist
            ? JSON.parse(savedGuestWishlist)
            : [];

          // Get user's MongoDB wishlist
          const response = await fetch("/api/wishlist");

          if (!response.ok) {
            throw new Error("Failed to fetch wishlist");
          }

          const data = await response.json();

          const databaseWishlist: Product[] = data.wishlist?.items || [];

          // Start with MongoDB wishlist
          const mergedWishlist = [...databaseWishlist];

          // Merge guest wishlist
          guestWishlist.forEach((guestItem) => {
            const existingItem = mergedWishlist.find(
              (item) => item.id === guestItem.id,
            );

            // Add only if product
            // doesn't already exist
            if (!existingItem) {
              mergedWishlist.push(guestItem);
            }
          });

          // Update React state
          setWishlist(mergedWishlist);

          // Save merged wishlist
          // to MongoDB
          if (guestWishlist.length > 0) {
            await fetch("/api/wishlist", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                items: mergedWishlist,
              }),
            });

            // Guest wishlist is now
            // safely stored in MongoDB
            localStorage.removeItem("wishlist");
          }

          return;
        }

        // Logged-out user
        const savedWishlist = localStorage.getItem("wishlist");

        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
      } catch (error) {
        console.error("Load wishlist error:", error);

        setWishlist([]);
      } finally {
        setIsWishlistLoading(false);
      }
    };

    loadWishlist();
  }, [status]);

  // Save guest wishlist to localStorage
  useEffect(() => {
    if (status === "unauthenticated" && !isWishlistLoading) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, status, isWishlistLoading]);

  const saveWishlistToDatabase = async (updatedWishlist: Product[]) => {
    try {
      const response = await fetch("/api/wishlist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: updatedWishlist,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message || "Failed to save wishlist");
      }
    } catch (error) {
      console.error("Save wishlist error:", error);
    }
  };

  const addToWishlist = (product: Product) => {
    const existingItem = wishlist.find(
      (wishlistItem) => wishlistItem.id === product.id,
    );

    if (existingItem) {
      return;
    }

    const updatedWishlist = [...wishlist, product];

    setWishlist(updatedWishlist);

    if (status === "authenticated") {
      saveWishlistToDatabase(updatedWishlist);
    }
  };

  const removeFromWishlist = (product: Product) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== product.id);

    setWishlist(updatedWishlist);

    if (status === "authenticated") {
      saveWishlistToDatabase(updatedWishlist);
    }
  };

  const wishlistCount = wishlist.length;

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    wishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
