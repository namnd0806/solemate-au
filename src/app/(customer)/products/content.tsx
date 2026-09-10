"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: { name: string; slug: string };
  variants: Array<{
    id: string;
    price: number;
    sale_price: number | null;
  }>;
  images: Array<{
    id: string;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
}

interface ProductsData {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const [productsData, setProductsData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [brandFilter, setBrandFilter] = useState(searchParams.get("brand_id") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (brandFilter) params.append("brand_id", brandFilter);
      params.append("sort_by", sortBy);
      params.append("page", currentPage.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/v1/products?${params}`);
      if (res.ok) {
        setProductsData(await res.json());
      }
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, brandFilter, sortBy, currentPage]);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch {
      console.error("Failed to fetch brands");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchQuery, brandFilter, sortBy]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const getEffectivePrice = (product: Product) => {
    if (!product.variants.length) return 0;
    const prices = product.variants.map((v) =>
      v.sale_price !== null ? v.sale_price : v.price
    );
    return Math.min(...prices);
  };

  const getOriginalPrice = (product: Product) => {
    if (!product.variants.length) return 0;
    return Math.min(...product.variants.map((v) => v.price));
  };

  const hasSale = (product: Product) => {
    return product.variants.some((v) => v.sale_price && v.sale_price < v.price);
  };

  const totalPages = productsData ? Math.ceil(productsData.total / productsData.limit) : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">All Products</h1>
        <p className="text-muted-foreground">
          Browse our complete collection of premium footwear
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Filters Sidebar */}
        <aside className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Search</h3>
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Brand</h3>
            <div className="space-y-2 text-sm">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="brand"
                    value={brand.id}
                    checked={brandFilter === brand.id}
                    onChange={(e) =>
                      setBrandFilter(e.target.checked ? e.target.value : "")
                    }
                    className="rounded"
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {brandFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrandFilter("")}
              className="w-full"
            >
              Clear Filters
            </Button>
          )}
        </aside>

        {/* Products Grid */}
        <div>
          {/* Sort and Display Options */}
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${productsData?.total || 0} products found`}
            </p>
            <select
              className="rounded-md border px-3 py-1.5 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Product Grid */}
          {!loading && productsData?.products ? (
            <>
              {productsData.products.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {productsData.products.map((product) => {
                    const effectivePrice = getEffectivePrice(product);
                    const originalPrice = getOriginalPrice(product);
                    const onSale = hasSale(product);
                    const primaryImage = product.images.find((img) => img.is_primary);

                    return (
                      <Link key={product.id} href={`/products/${product.slug}`}>
                        <Card className="group overflow-hidden transition-all hover:shadow-lg">
                          <div className="relative aspect-square bg-muted overflow-hidden">
                            {primaryImage && (
                              <Image
                                src={primaryImage.url}
                                alt={primaryImage.alt_text || product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                          </div>
                          <CardContent className="p-4">
                            <p className="mb-1 text-xs text-muted-foreground">
                              {product.brand.name}
                            </p>
                            <h3 className="mb-2 font-semibold group-hover:underline line-clamp-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {onSale && effectivePrice < originalPrice ? (
                                <>
                                  <span className="font-bold text-destructive">
                                    ${effectivePrice.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-muted-foreground line-through">
                                    ${originalPrice.toFixed(2)}
                                  </span>
                                  <Badge variant="destructive" className="ml-auto">
                                    Sale
                                  </Badge>
                                </>
                              ) : (
                                <span className="font-bold">
                                  ${effectivePrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
