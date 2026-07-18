
"use client"
import Hero from "@/components/home/Hero"
import Navbar from "@/components/layout/Navbar" 
import ProductCard from "@/components/product/ProductCard"
import { products} from "@/data/products"
import SearchBar from "@/components/search/SearchBar"
import { useState } from "react"
import useCart from "@/hooks/useCart"
import useWishlist from "@/hooks/useWishlist"

export default function Home() {
  const { addToCart , cartCount } = useCart();
  const { addToWishlist ,wishlistCount} = useWishlist();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const searchText = search.trim().toLowerCase();
  const [sortBy, setSortBy] = useState("default");

  const filteredProducts = products.filter((product) =>{
    const matchesSearch =
        searchText === "" ||
        product.title.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText);

    const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const sortedProducts = [...filteredProducts]

  switch (sortBy) {
      case "price-low":
          sortedProducts.sort(
            ( prodA,prodB )=> prodA.price - prodB.price
          );
          break;
      case "price-high":
          sortedProducts.sort(
            ( prodA,prodB )=> prodB.price - prodA.price
          );
          break;
      case "name-asc":
          sortedProducts.sort(
            ( prodA,prodB )=> prodA.title.localeCompare(prodB.title)
          );
          break;
      case "name-desc":
          sortedProducts.sort(
            ( prodA,prodB )=> prodB.title.localeCompare(prodA.title)
          );
          break;
  }
  return (
    <>
    
      <Navbar 
        cartCount = {cartCount}
        wishlistCount = {wishlistCount}
      />
    
      <Hero />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <div className="flex gap-3 my-4 flex-wrap">
          {categories.map((category) => (
              <button
              className={`rounded-lg border px-4 py-2 transition
                    ${
                        selectedCategory === category
                            ? "bg-blue-600 text-white"
                            : "bg-white hover:bg-gray-100"
                    }`}
                  key={category}
                  onClick={() => setSelectedCategory(category)}
              >
                  {category}
              </button>
          ))}
          <select
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
        <h2 className="mb-6 text-3xl font-bold">
          Featured Products
        </h2>

        <div className="grid grid-cols-3 gap-6">
         {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                addToWishlist={addToWishlist}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">
              No products found.
            </p>
          )}
           
        </div>
        
      </section>
     
    </>
    
  );
}