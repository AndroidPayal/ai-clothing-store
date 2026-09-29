"use client";

import { useEffect, useState } from "react";

type AdminProduct = {
  _id: string;
  id: number;
  title: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  thumbnail: string;
  image: string;
  category: string;
  description: string;
};

type ProductFormData = {
  title: string;
  price: string;
  stockQuantity: string;
  inStock: boolean;
  thumbnail: string;
  image: string;
  category: string;
  description: string;
};

const emptyForm: ProductFormData = {
  title: "",
  price: "",
  stockQuantity: "0",
  inStock: true,
  thumbnail: "",
  image: "",
  category: "",
  description: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>(emptyForm);

  const [isSaving, setIsSaving] = useState(false);

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await fetch("/api/admin/products", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch products");
        }

        if (cancelled) return;

        setProducts(
          Array.isArray(data.products)
            ? data.products.map((product: AdminProduct) => ({
                ...product,
                stockQuantity:
                  typeof product.stockQuantity === "number"
                    ? product.stockQuantity
                    : 0,
              }))
            : [],
        );
      } catch (error) {
        if (cancelled) return;

        console.error("Admin products fetch error:", error);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const stockQuantity = Number(formData.stockQuantity);

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError(
        "Stock quantity must be a whole number greater than or equal to 0.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          price: Number(formData.price),
          stockQuantity,
          inStock: stockQuantity > 0,
          thumbnail: formData.thumbnail.trim(),
          image: formData.image.trim(),
          category: formData.category,
          description: formData.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      setProducts((currentProducts) => [data.product, ...currentProducts]);

      resetForm();
    } catch (error) {
      console.error("Add product error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to create product",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    const stockQuantity = Number(formData.stockQuantity);

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError(
        "Stock quantity must be a whole number greater than or equal to 0.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(editingProduct._id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            price: Number(formData.price),
            stockQuantity,
            inStock: stockQuantity > 0,
            thumbnail: formData.thumbnail.trim(),
            image: formData.image.trim(),
            category: formData.category,
            description: formData.description.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === editingProduct._id ? data.product : product,
        ),
      );

      resetForm();
    } catch (error) {
      console.error("Edit product error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to update product",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(product._id)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) => currentProduct._id !== product._id,
        ),
      );
    } catch (error) {
      console.error("Delete product error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    }
  };

  const startEditing = (product: AdminProduct) => {
    setEditingProduct(product);

    setFormData({
      title: product.title,
      price: String(product.price),
      stockQuantity: String(
        typeof product.stockQuantity === "number" ? product.stockQuantity : 0,
      ),
      inStock:
        typeof product.stockQuantity === "number"
          ? product.stockQuantity > 0
          : product.inStock,
      thumbnail: product.thumbnail,
      image: product.image,
      category: product.category,
      description: product.description,
    });

    setError("");
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <section className="p-4 sm:p-6 lg:p-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">
          Products
        </h1>

        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-lg font-medium text-gray-600">
            Loading products...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Products
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage products, pricing and inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");

            if (showForm) {
              resetForm();
            } else {
              setEditingProduct(null);
              setFormData(emptyForm);
              setShowForm(true);
            }
          }}
          className="rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
        >
          {showForm ? "Close Form" : "Add Product"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
          className="mb-8 rounded-xl border bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <input
              name="title"
              type="text"
              placeholder="Product Title"
              value={formData.title}
              onChange={handleFormChange}
              maxLength={150}
              required
              className="rounded-lg border p-3 text-gray-900 outline-none focus:border-black"
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleFormChange}
              min="0"
              step="0.01"
              required
              className="rounded-lg border p-3 text-gray-900 outline-none focus:border-black"
            />

            <input
              name="stockQuantity"
              type="number"
              placeholder="Stock Quantity"
              value={formData.stockQuantity}
              onChange={handleFormChange}
              min="0"
              step="1"
              required
              className="rounded-lg border p-3 text-gray-900 outline-none focus:border-black"
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleFormChange}
              required
              className="rounded-lg border p-3 text-gray-900 outline-none focus:border-black"
            >
              <option value="" disabled>
                Select Category
              </option>

              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>

            <input
              name="thumbnail"
              type="text"
              placeholder="Thumbnail image path"
              value={formData.thumbnail}
              onChange={handleFormChange}
              required
              className="rounded-lg border p-3 text-gray-900 outline-none focus:border-black"
            />

            <input
              name="image"
              type="text"
              placeholder="Main image path"
              value={formData.image}
              onChange={handleFormChange}
              required
              className="rounded-lg border p-3 text-gray-900 outline-none focus:border-black"
            />
          </div>

          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleFormChange}
            maxLength={2000}
            required
            rows={4}
            className="mt-5 w-full rounded-lg border p-3 text-gray-900 outline-none focus:border-black"
          />

          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Stock status is calculated automatically from the quantity.
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {Number(formData.stockQuantity) > 0
                ? `${formData.stockQuantity} pieces available`
                : "Out of stock"}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSaving
                ? editingProduct
                  ? "Updating..."
                  : "Adding..."
                : editingProduct
                  ? "Update Product"
                  : "Add Product"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-lg text-gray-600">No products found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-6 py-4 font-semibold text-gray-900">
                  Product
                </th>

                <th className="px-6 py-4 font-semibold text-gray-900">
                  Category
                </th>

                <th className="px-6 py-4 font-semibold text-gray-900">Price</th>

                <th className="px-6 py-4 font-semibold text-gray-900">
                  Inventory
                </th>

                <th className="px-6 py-4 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const stockQuantity =
                  typeof product.stockQuantity === "number"
                    ? product.stockQuantity
                    : 0;

                const isInStock = stockQuantity > 0;

                return (
                  <tr
                    key={product._id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />

                        <div>
                          <p className="font-semibold text-gray-900">
                            {product.title}
                          </p>

                          <p className="text-sm text-gray-500">
                            ID: {product.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {product.category}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                            isInStock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isInStock ? "In Stock" : "Out of Stock"}
                        </span>

                        <span className="text-sm font-medium text-gray-700">
                          {stockQuantity}{" "}
                          {stockQuantity === 1 ? "piece" : "pieces"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(product)}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
