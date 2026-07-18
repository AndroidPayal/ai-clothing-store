"use client";

import { createContext, useState, type ReactNode} from "react";
import { type Product, type CartItem} from "@/data/products"

type CartContextType = {
    cart: CartItem[];

    addToCart: (
        product: Product,
        quantity?: number) => void;

    removeFromCart: (cartItem: CartItem) => void;

    increaseQuantity: (cartItem: CartItem) => void;

    decreaseQuantity: (cartItem: CartItem) => void;

    cartCount: number;

    cartTotal: number
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [cart, setCart] = useState<CartItem[]>(()=>{
        try{
            const savedCart = localStorage.getItem("cart");
            return (savedCart ? JSON.parse(savedCart):[])
        }catch{
            return [];
        }
    });

    const cartCount = cart.reduce(
        (runningTotal, cartItem) => runningTotal + cartItem.quantity,
        0
    );
    const cartTotal = cart.reduce( (runningTotal, cartItem) => {
        return runningTotal 
            + 
        (cartItem.product.price * cartItem.quantity);
    }, 0)

    const addToCart = (
        product: Product,
        quantity: number = 1
    ) => {
        const existingItem = cart.find(
        (cartItem) => cartItem.product.id === product.id  
        );// or else we can write {return cartItem.product.id === product.id }
        
        if(existingItem){
        const newCartArray = cart.map((item)=>{
            if (item.product.id === product.id){
            return {...item,
                quantity: item.quantity + quantity
            };
            }else{
            return item
            }
        });
        setCart(newCartArray)
        }else{
        setCart([...cart, {
            product: product,
            quantity: quantity
        }]);
        }
    };

    const removeFromCart = (cartItem: CartItem) => {
        const newArray = cart.filter(
        (item) => item.product.id !== cartItem.product.id
        );

        setCart(newArray);
    };

    const increaseQuantity = (cartItem: CartItem) => {
        addToCart(cartItem.product);
    };

    const decreaseQuantity = (cartItem:CartItem) => {
        if(cartItem.quantity > 1){
        const newArray = cart.map(item =>{
            if(item.product.id === cartItem.product.id){
            return {...item,
                quantity: item.quantity-1
            }
            }else return item;
        })
        setCart(newArray);
        
        }else{
        removeFromCart(cartItem);
        }
    }

    const value = {
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        cartCount,
        cartTotal
    }


    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}