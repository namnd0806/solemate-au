"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock_qty: number;
  status: string;
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/v1/admin/products?limit=100");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "DISCONTINUED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage inventory and product details</p>
          </div>
          <Button asChild className="bg-accent hover:bg-accent/90 text-white font-semibold">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No products found matching your search." : "No products yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-semibold text-muted-foreground">
                      <th className="pb-3 px-4">SKU</th>
                      <th className="pb-3 px-4">Name</th>
                      <th className="pb-3 px-4">Category</th>
                      <th className="pb-3 px-4 text-right">Price</th>
                      <th className="pb-3 px-4 text-center">Stock</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 text-sm font-mono font-semibold text-accent">
                          {product.sku}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium">{product.name}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {product.category}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-right">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-sm text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock_qty > 10 ? "bg-green-100 text-green-800" : product.stock_qty > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                            {product.stock_qty}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <Badge className={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0 hover:bg-accent hover:text-white"
                            >
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit2 className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Products</p>
              <p className="text-3xl font-bold text-accent">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">
                {products.filter((p) => p.stock_qty > 0 && p.stock_qty <= 10).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-destructive">
                {products.filter((p) => p.stock_qty === 0).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
