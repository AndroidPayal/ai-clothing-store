"use client";

import { useEffect, useState } from "react";

type AdminProduct = {
  _id: string;
  id: number;
  title: string;
  price: number;
  inStock: boolean;
  thumbnail: string;
  image: string;
  category: string;
  description: string;
};

type ProductFormData = {
  id: string;
  title: string;
  price: string;
  inStock: boolean;
  thumbnail: string;
  image: string;
  category: string;
  description: string;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    id: "",
    title: "",
    price: "",
    inStock: true,
    thumbnail: "",
    image: "",
    category: "",
    description: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/admin/products");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch products");
        }

        setProducts(data.products);
      } catch (error) {
        console.error("Admin products fetch error:", error);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(formData.id),
          title: formData.title,
          price: Number(formData.price),
          inStock: formData.inStock,
          thumbnail: formData.thumbnail,
          image: formData.image,
          category: formData.category,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      setProducts((currentProducts) => [data.product, ...currentProducts]);

      setFormData({
        id: "",
        title: "",
        price: "",
        inStock: true,
        thumbnail: "",
        image: "",
        category: "",
        description: "",
      });

      setShowForm(false);
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

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(
        `/api/admin/products/${editingProduct._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            price: Number(formData.price),
            inStock: formData.inStock,
            thumbnail: formData.thumbnail,
            image: formData.image,
            category: formData.category,
            description: formData.description,
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

      setEditingProduct(null);
      setShowForm(false);

      setFormData({
        id: "",
        title: "",
        price: "",
        inStock: true,
        thumbnail: "",
        image: "",
        category: "",
        description: "",
      });
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

      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "DELETE",
      });

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

  if (isLoading) {
    return (
      <section className="p-4 sm:p-6 lg:p-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Products</h1>

        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-lg font-medium text-gray-600">
            Loading products...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Products</h1>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900">Products</h1>

        <button
          onClick={() => setShowForm((current) => !current)}
          className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          {showForm ? "Close Form" : "Add Product"}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-lg text-gray-600">No products found.</p>
        </div>
      ) : (
        <div>
          {showForm && (
            <form
              onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
              className="mb-8 rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <input
                  name="id"
                  type="number"
                  placeholder="Product ID"
                  value={formData.id}
                  onChange={handleFormChange}
                  required
                  className="rounded-lg border p-3 text-gray-900"
                />

                <input
                  name="title"
                  type="text"
                  placeholder="Product Title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  className="rounded-lg border p-3 text-gray-900"
                />

                <input
                  name="price"
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleFormChange}
                  required
                  className="rounded-lg border p-3 text-gray-900"
                />

                <input
                  name="category"
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                  className="rounded-lg border p-3 text-gray-900"
                />

                <input
                  name="thumbnail"
                  type="text"
                  placeholder="Thumbnail image path"
                  value={formData.thumbnail}
                  onChange={handleFormChange}
                  required
                  className="rounded-lg border p-3 text-gray-900"
                />

                <input
                  name="image"
                  type="text"
                  placeholder="Main image path"
                  value={formData.image}
                  onChange={handleFormChange}
                  required
                  className="rounded-lg border p-3 text-gray-900"
                />
              </div>

              <textarea
                name="description"
                placeholder="Product Description"
                value={formData.description}
                onChange={handleFormChange}
                required
                rows={4}
                className="mt-5 w-full rounded-lg border p-3 text-gray-900"
              />

              <label className="mt-5 flex items-center gap-3 text-gray-900">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      inStock: e.target.checked,
                    }))
                  }
                />
                In Stock
              </label>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400"
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
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);

                    setFormData({
                      id: "",
                      title: "",
                      price: "",
                      inStock: true,
                      thumbnail: "",
                      image: "",
                      category: "",
                      description: "",
                    });
                  }}
                  className="rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-6 py-4 font-semibold text-gray-900">
                    Product
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-900">
                    Category
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-900">
                    Price
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-900">
                    Stock
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
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
                      ₹{product.price}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          product.inStock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);

                            setFormData({
                              id: String(product.id),
                              title: product.title,
                              price: String(product.price),
                              inStock: product.inStock,
                              thumbnail: product.thumbnail,
                              image: product.image,
                              category: product.category,
                              description: product.description,
                            });

                            setShowForm(true);
                          }}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
