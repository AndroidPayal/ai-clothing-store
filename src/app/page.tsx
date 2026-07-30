"use client";

import Hero from "@/components/home/Hero";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/product/ProductCard";
import SearchBar from "@/components/search/SearchBar";
import { useEffect, useState } from "react";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import EmptyState from "@/components/common/EmptyState";
import type { Product } from "@/types/Product";

export default function Home() {
  const { addToCart, cartCount } = useCart();
  const { addToWishlist, wishlistCount } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/products");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch products");
        }

        setProducts(data.products);
      } catch (error) {
        console.error("Products fetch error:", error);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const searchText = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchText === "" ||
      product.title.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const sortedProducts = [...filteredProducts];

  switch (sortBy) {
    case "price-low":
      sortedProducts.sort((prodA, prodB) => prodA.price - prodB.price);
      break;

    case "price-high":
      sortedProducts.sort((prodA, prodB) => prodB.price - prodA.price);
      break;

    case "name-asc":
      sortedProducts.sort((prodA, prodB) =>
        prodA.title.localeCompare(prodB.title),
      );
      break;

    case "name-desc":
      sortedProducts.sort((prodA, prodB) =>
        prodB.title.localeCompare(prodA.title),
      );
      break;
  }

  return (
    <>
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />

      <Hero />

      <SearchBar search={search} setSearch={setSearch} />

      <div className="my-4 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            className={`rounded-lg border px-4 py-2 transition ${
              selectedCategory === category
                ? "bg-blue-600 text-gray-800"
                : "bg-white text-gray-800 hover:bg-gray-400"
            }`}
            key={category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}

        <select
          className="text-gray-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="name-asc">Name: A → Z</option>
          <option value="name-desc">Name: Z → A</option>
        </select>
      </div>

      <section className="mx-auto max-w-5xl p-8">
        <h2 className="mb-6 text-3xl font-bold">Featured Products</h2>

        {isLoading && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="text-lg font-medium text-gray-600">
              Loading products...
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>
          </div>
        )}

        {!isLoading &&
          !error &&
          (sortedProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  addToWishlist={addToWishlist}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="🔍"
              title="No Products Found"
              description="Try another search keyword."
              buttonText="Back to Home"
              href="/"
            />
          ))}
      </section>
    </>
  );
}
