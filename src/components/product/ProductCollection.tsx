"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ProductCard from "@/components/product/ProductCard";
import SearchBar from "@/components/search/SearchBar";
import EmptyState from "@/components/common/EmptyState";

import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";

import type { Product } from "@/types/Product";

type ProductCollectionProps = {
  initialCategory?: string;
  initialCollection?: string;
  initialSort?: "default" | "newest";
  variant?: "home" | "shop";
};

const categories = ["All", "women", "men", "kids"];

export default function ProductCollection({
  initialCategory = "All",
  initialCollection = "",
  initialSort = "default",
  variant = "home",
}: ProductCollectionProps) {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const selectedCategory = initialCategory;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const query = new URLSearchParams();

        if (initialCategory !== "All") {
          query.set("category", initialCategory);
        }

        if (initialSort === "newest") {
          query.set("sort", "newest");
        }

        const response = await fetch(
          `/api/products${query.size > 0 ? `?${query.toString()}` : ""}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch products");
        }

        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        console.error("Products fetch error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading products.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [initialCategory, initialSort]);

  const searchText = search.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const title = product.title?.toLowerCase() ?? "";
      const category = product.category?.toLowerCase() ?? "";
      const description = product.description?.toLowerCase() ?? "";

      const matchesSearch =
        searchText === "" ||
        title.includes(searchText) ||
        category.includes(searchText) ||
        description.includes(searchText);

      const matchesCategory =
        selectedCategory.toLowerCase() === "all" ||
        category === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    if (initialCollection === "new-arrivals") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [filteredProducts, initialCollection, sortBy]);

  const handleCategoryChange = (category: string) => {
    if (category === "All") {
      router.push("/products");
      return;
    }

    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <section
      id="collection"
      className="bg-muslin px-5 py-16 sm:px-8 sm:py-20 lg:px-16 lg:py-28"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Section Intro */}
        <div className="border-b border-kora pb-8 sm:pb-10">
          {variant === "home" ? (
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-awadh-terracotta sm:w-10"
                  />

                  <span className="font-utility text-[8px] tracking-[0.2em] text-awadh-ink sm:text-[9px]">
                    SELECTED PIECES
                  </span>
                </div>

                <h2 className="font-display text-[2.8rem] leading-[0.94] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
                  Pieces to begin
                  <br />
                  somewhere.
                </h2>

                <div className="mt-7 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-px w-10 bg-awadh-terracotta sm:w-14"
                  />

                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-awadh-terracotta"
                  />
                </div>
              </div>

              <p className="max-w-md font-editorial text-base leading-relaxed text-thread-grey sm:text-lg md:text-xl">
                Explore pieces selected with intention. Discover something that
                feels right for your everyday story.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
              <div>
                <p className="font-utility text-[8px] tracking-[0.2em] text-awadh-ink sm:text-[9px] sm:tracking-[0.22em]">
                  SOZAN — SHOP
                </p>

                <h1 className="mt-5 font-display text-[2.8rem] leading-[0.94] tracking-tight text-thread-black sm:mt-6 sm:text-6xl lg:text-7xl">
                  {initialCollection === "new-arrivals" ? (
                    <>
                      New
                      <br />
                      arrivals.
                    </>
                  ) : selectedCategory === "All" ? (
                    <>
                      The complete
                      <br />
                      collection.
                    </>
                  ) : (
                    <>
                      {selectedCategory.toUpperCase()}
                      <br />
                      collection.
                    </>
                  )}
                </h1>
              </div>

              <p className="max-w-md font-editorial text-base leading-relaxed text-thread-grey sm:text-lg md:text-xl">
                Browse every piece. Search, filter, and discover what belongs in
                your wardrobe.
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-6 border-b border-kora py-5 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* Categories */}
          <div className="flex max-w-full gap-6 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:pb-0">
            {categories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  aria-current={isActive ? "page" : undefined}
                  className={`shrink-0 font-utility text-[8px] tracking-[0.18em] transition-colors sm:text-[9px] ${
                    isActive
                      ? "text-awadh-ink underline underline-offset-8"
                      : "text-thread-grey hover:text-thread-black"
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <div className="flex items-center justify-between gap-4 sm:justify-start">
            <span className="font-utility text-[8px] tracking-[0.16em] text-thread-grey sm:text-[9px]">
              SORT BY
            </span>

            <select
              aria-label="Sort products"
              className="min-w-0 cursor-pointer border-none bg-transparent font-utility text-[8px] tracking-[0.14em] text-thread-black outline-none sm:text-[9px] sm:tracking-[0.16em]"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="default">FEATURED</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
              <option value="name-asc">NAME: A TO Z</option>
              <option value="name-desc">NAME: Z TO A</option>
            </select>
          </div>
        </div>

        {/* Product Count */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between py-5 sm:py-6">
            <p className="font-utility text-[8px] tracking-[0.18em] text-thread-grey sm:text-[9px]">
              {sortedProducts.length}{" "}
              {sortedProducts.length === 1 ? "PIECE" : "PIECES"}
            </p>

            <p className="hidden font-utility text-[8px] tracking-[0.18em] text-thread-grey sm:block">
              SELECTED WITH INTENTION
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse" aria-hidden="true">
                <div className="aspect-[3/4] bg-kora/30" />

                <div className="mt-5 h-3 w-2/3 bg-kora/30" />

                <div className="mt-3 h-3 w-1/3 bg-kora/30" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div
            role="alert"
            className="border border-red-200 bg-red-50 p-6 text-center sm:p-8"
          >
            <p className="font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 font-utility text-[9px] tracking-[0.16em] text-thread-black underline underline-offset-4"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* Products */}
        {!isLoading &&
          !error &&
          (sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3">
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
              title="No Pieces Found"
              description="Try another search or explore the complete collection."
              buttonText="View All Pieces"
              href="/products"
            />
          ))}

        {/* Home Editorial Footer */}
        {variant === "home" && !isLoading && !error && (
          <div className="mt-14 flex flex-col gap-4 border-t border-kora pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-utility text-[7px] tracking-[0.18em] text-thread-grey sm:text-[8px]">
              DESIGNED FOR EVERYDAY STORIES
            </p>

            <button
              type="button"
              onClick={() => router.push("/products")}
              className="self-start font-utility text-[8px] tracking-[0.18em] text-awadh-ink underline underline-offset-8 transition-colors hover:text-thread-black sm:text-[9px]"
            >
              VIEW ALL PIECES →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
