"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import SearchBar from "@/components/search/SearchBar";
import EmptyState from "@/components/common/EmptyState";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import type { Product } from "@/types/Product";
import { useRouter } from "next/navigation";

type ProductCollectionProps = {
  initialCategory?: string;
  initialCollection?: string;
  variant?: "home" | "shop";
};

export default function ProductCollection({
  initialCategory = "All",
  initialCollection = "",
  variant = "home",
}: ProductCollectionProps) {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchText === "" ||
        product.title.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText);

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, selectedCategory]);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products],
  );

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
  }, [filteredProducts, sortBy]);

  return (
    <section
      id="collection"
      className="bg-muslin px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="border-b border-kora pb-8">
          {variant === "home" ? (
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                {/* <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                  04 — THE PIECES
                </p> */}

                <h2 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
                  Pieces to begin
                  <br />
                  somewhere.
                </h2>
              </div>

              <p className="max-w-sm font-editorial text-lg leading-relaxed text-thread-grey">
                Explore the collection. Search, discover, and find the pieces
                that belong in your story.
              </p>
            </div>
          ) : (
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                  SOZAN — SHOP
                </p>
                <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
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

              <p className="max-w-sm font-editorial text-lg leading-relaxed text-thread-grey">
                Browse every piece. Search, filter, and discover what belongs in
                your wardrobe.
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mt-12">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Filters */}
        <div className="flex flex-col justify-between gap-8 border-b border-kora py-6 lg:flex-row lg:items-center">
          <div className="flex max-w-full gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);

                  if (category === "All") {
                    router.push("/products");
                  } else {
                    router.push(
                      `/products?category=${encodeURIComponent(category)}`,
                    );
                  }
                }}
                className={`
                    shrink-0
                  font-utility
                  text-[9px]
                  tracking-[0.18em]
                  transition-colors
                  ${
                    selectedCategory === category
                      ? "text-awadh-ink underline underline-offset-8"
                      : "text-thread-grey hover:text-thread-black"
                  }
                `}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4">
            <span className="font-utility text-[9px] tracking-[0.16em] text-thread-grey">
              SORT BY
            </span>

            <select
              className="
                cursor-pointer
                border-none
                bg-transparent
                font-utility
                text-[9px]
                tracking-[0.16em]
                text-thread-black
                outline-none
              "
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

        {/* Count */}
        <div className="flex items-center justify-between py-6">
          <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
            {sortedProducts.length}{" "}
            {sortedProducts.length === 1 ? "PIECE" : "PIECES"}
          </p>

          <p className="hidden font-utility text-[9px] tracking-[0.18em] text-thread-grey sm:block">
            SELECTED WITH INTENTION
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-[3/4] bg-kora/30" />

                <div className="mt-5 h-3 w-2/3 bg-kora/30" />

                <div className="mt-3 h-3 w-1/3 bg-kora/30" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Products */}
        {!isLoading &&
          !error &&
          (sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}
