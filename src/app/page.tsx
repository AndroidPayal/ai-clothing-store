"use client";

import Hero from "@/components/home/Hero";
import CraftDiscovery from "@/components/home/CraftDiscovery";
import CollectionReveal from "@/components/home/CollectionReveal";
import ProductCollection from "@/components/product/ProductCollection";

import HowItWorks from "@/components/home/HowItWorks";


export default function Home() {

  return (
    <>
      <Hero />

      <CraftDiscovery />
      <HowItWorks />
      <CollectionReveal />

      <ProductCollection />
    </>
  );
}
