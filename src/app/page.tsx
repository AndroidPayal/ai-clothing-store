"use client";

import Hero from "@/components/home/Hero";
import Navbar from "@/components/layout/Navbar";
import CraftDiscovery from "@/components/home/CraftDiscovery";
import CollectionReveal from "@/components/home/CollectionReveal";
import ProductCollection from "@/components/product/ProductCollection";

import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
export default function Home() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <>
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />

      <Hero />

      <CraftDiscovery />

      <CollectionReveal />

      <ProductCollection />
    </>
  );
}
