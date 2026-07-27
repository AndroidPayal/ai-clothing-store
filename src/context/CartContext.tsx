"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { type Product, type CartItem } from "@/data/products";

type CartContextType = {
  cart: CartItem[];

  addToCart: (product: Product, quantity?: number) => void;

  removeFromCart: (cartItem: CartItem) => void;

  increaseQuantity: (cartItem: CartItem) => void;

  decreaseQuantity: (cartItem: CartItem) => void;

  cartCount: number;

  cartTotal: number;

  clearCart: () => void;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();

  const [cart, setCart] = useState<CartItem[]>([]);

  const [isCartLoading, setIsCartLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    const loadCart = async () => {
      try {
        setIsCartLoading(true);

        // Logged-in user
        if (status === "authenticated") {
          // Get guest cart before loading MongoDB cart
          const savedGuestCart = localStorage.getItem("cart");

          const guestCart: CartItem[] = savedGuestCart
            ? JSON.parse(savedGuestCart)
            : [];

          // Get user's MongoDB cart
          const response = await fetch("/api/cart");

          if (!response.ok) {
            throw new Error("Failed to fetch cart");
          }

          const data = await response.json();

          const databaseCart: CartItem[] = data.cart?.items || [];

          // Start with MongoDB cart
          const mergedCart = [...databaseCart];

          // Merge guest cart
          guestCart.forEach((guestItem) => {
            const existingItem = mergedCart.find(
              (item) => item.product.id === guestItem.product.id,
            );

            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
            } else {
              mergedCart.push(guestItem);
            }
          });

          // Update React state
          setCart(mergedCart);

          // Save merged cart to MongoDB
          if (guestCart.length > 0) {
            await fetch("/api/cart", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                items: mergedCart,
              }),
            });

            // Guest cart is now safely
            // stored in MongoDB
            localStorage.removeItem("cart");
          }

          return;
        }

        // Logged-out user
        const savedCart = localStorage.getItem("cart");

        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch (error) {
        console.error("Load cart error:", error);

        setCart([]);
      } finally {
        setIsCartLoading(false);
      }
    };

    loadCart();
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated" && !isCartLoading) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, status, isCartLoading]);

  const cartCount = cart.reduce(
    (runningTotal, cartItem) => runningTotal + cartItem.quantity,
    0,
  );

  const cartTotal = cart.reduce(
    (runningTotal, cartItem) =>
      runningTotal + cartItem.product.price * cartItem.quantity,
    0,
  );

  const saveCartToDatabase = async (updatedCart: CartItem[]) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: updatedCart,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message || "Failed to save cart");
      }
    } catch (error) {
      console.error("Save cart error:", error);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.product.id === product.id,
    );

    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = cart.map((item) => {
        if (item.product.id === product.id) {
          return {
            ...item,
            quantity: item.quantity + quantity,
          };
        }

        return item;
      });
    } else {
      updatedCart = [
        ...cart,
        {
          product,
          quantity,
        },
      ];
    }

    setCart(updatedCart);

    if (status === "authenticated") {
      saveCartToDatabase(updatedCart);
    }
  };

  const removeFromCart = (cartItem: CartItem) => {
    const updatedCart = cart.filter(
      (item) => item.product.id !== cartItem.product.id,
    );

    setCart(updatedCart);

    if (status === "authenticated") {
      saveCartToDatabase(updatedCart);
    }
  };

  const increaseQuantity = (cartItem: CartItem) => {
    addToCart(cartItem.product);
  };

  const decreaseQuantity = (cartItem: CartItem) => {
    let updatedCart: CartItem[];

    if (cartItem.quantity > 1) {
      updatedCart = cart.map((item) => {
        if (item.product.id === cartItem.product.id) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      });
    } else {
      updatedCart = cart.filter(
        (item) => item.product.id !== cartItem.product.id,
      );
    }

    setCart(updatedCart);

    if (status === "authenticated") {
      saveCartToDatabase(updatedCart);
    }
  };

  const clearCart = () => {
    const updatedCart: CartItem[] = [];

    setCart(updatedCart);

    if (status === "authenticated") {
      saveCartToDatabase(updatedCart);
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartCount,
    cartTotal,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
