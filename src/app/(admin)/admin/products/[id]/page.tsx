"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

interface Variant {
  id?: string;
  sku: string;
  colour: string;
  size: string;
  price: number;
  sale_price?: number;
  stock: number;
}

interface ProductFormData {
  brand: string;
  product_name: string;
  slug: string;
  description: string;
  status: string;
  category_id: string;
  images: string[];
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
}

export default function ProductFormPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const [productId, setProductId] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState<ProductFormData>({
    brand: "",
    product_name: "",
    slug: "",
    description: "",
    status: "ACTIVE",
    category_id: "",
    images: [],
    variants: [{ sku: "", colour: "", size: "", price: 0, stock: 0 }],
  });

  const initPage = async (id?: string) => {
    try {
      setLoading(true);
      const catRes = await fetch("/api/v1/categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      if (id) {
        const prodRes = await fetch(`/api/v1/admin/products/${id}`);
        if (prodRes.ok) {
          const product = await prodRes.json();
          setFormData({
            brand: product.brand,
            product_name: product.product_name,
            slug: product.slug,
            description: product.description,
            status: product.status,
            category_id: product.category_id,
            images: product.images || [],
            variants: product.variants || [
              { sku: "", colour: "", size: "", price: 0, stock: 0 },
            ],
          });
        }
      }
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    params.then((p) => {
      setProductId(p.id);
      initPage(p.id);
    });
  }, [params]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariantChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: field === "price" || field === "sale_price" || field === "stock"
        ? Number(value)
        : value,
    };
    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { sku: "", colour: "", size: "", price: 0, stock: 0 },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length === 1) {
      alert("Product must have at least one variant");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      setError("Please select a category");
      return;
    }
    if (formData.variants.some((v) => !v.sku || !v.price)) {
      setError("All variants must have SKU and price");
      return;
    }

    setSaving(true);
    try {
      const method = productId ? "PATCH" : "POST";
      const url = productId
        ? `/api/v1/admin/products/${productId}`
        : "/api/v1/admin/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await res.json();
        router.push("/admin/products");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to save product");
      }
    } catch (err) {
      setError("Error saving product");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {productId ? "Edit Product" : "Create Product"}
        </h1>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Brand
                  </label>
                  <Input
                    value={formData.brand}
                    onChange={(e) =>
                      handleInputChange("brand", e.target.value)
                    }
                    placeholder="e.g., Nike, Adidas"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      handleInputChange("category_id", e.target.value)
                    }
                    className="h-10 rounded-md border px-3 py-2 bg-white text-sm font-medium"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Product Name
                </label>
                <Input
                  value={formData.product_name}
                  onChange={(e) =>
                    handleInputChange("product_name", e.target.value)
                  }
                  placeholder="Product name"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Slug
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="product-slug"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Product description"
                  className="rounded-md border px-3 py-2 text-sm w-full min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="h-10 rounded-md border px-3 py-2 bg-white text-sm font-medium"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop images here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 5MB each
                </p>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image
                          src={img}
                          alt="Product"
                          width={200}
                          height={200}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Variants</CardTitle>
                <Button
                  type="button"
                  onClick={addVariant}
                  size="sm"
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.variants.map((variant, idx) => (
                <Card key={idx} className="bg-gray-50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-900">
                        Variant {idx + 1}
                      </h4>
                      {formData.variants.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                          SKU
                        </label>
                        <Input
                          value={variant.sku}
                          onChange={(e) =>
                            handleVariantChange(idx, "sku", e.target.value)
                          }
                          placeholder="e.g., PROD-001"
                          className="h-10"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                          Colour
                        </label>
                        <Input
                          value={variant.colour}
                          onChange={(e) =>
                            handleVariantChange(idx, "colour", e.target.value)
                          }
                          placeholder="e.g., Black"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                          Size
                        </label>
                        <Input
                          value={variant.size}
                          onChange={(e) =>
                            handleVariantChange(idx, "size", e.target.value)
                          }
                          placeholder="e.g., M"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                          Stock
                        </label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) =>
                            handleVariantChange(
                              idx,
                              "stock",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          className="h-10"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                          Price
                        </label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(
                              idx,
                              "price",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          className="h-10"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                          Sale Price (Optional)
                        </label>
                        <Input
                          type="number"
                          value={variant.sale_price || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              idx,
                              "sale_price",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          className="h-10"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold h-10"
            >
              {saving
                ? "Saving..."
                : productId
                  ? "Update Product"
                  : "Create Product"}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 h-10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
