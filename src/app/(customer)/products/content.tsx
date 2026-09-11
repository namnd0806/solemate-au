"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { X } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [brandFilter, setBrandFilter] = useState(searchParams.get("brand_id") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [inStock, setInStock] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (brandFilter) params.append("brand_id", brandFilter);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (inStock) params.append("inStock", "true");
      params.append("sort_by", sortBy);
      params.append("page", currentPage.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/v1/products?${params}`);
      if (res.ok) {
        setProductsData(await res.json());
      } else {
        setError("Failed to load products");
        setProductsData(null);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to load products");
      setProductsData(null);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, brandFilter, sortBy, currentPage, minPrice, maxPrice, inStock]);

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
  }, [searchQuery, brandFilter, sortBy, minPrice, maxPrice, inStock]);

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

  // Active filter chips
  const activeFilters = [
    ...(searchQuery ? [{ type: "search", label: `"${searchQuery}"`, value: searchQuery }] : []),
    ...(brandFilter ? [{ type: "brand", label: brands.find(b => b.id === brandFilter)?.name || "Unknown", value: brandFilter }] : []),
    ...(minPrice ? [{ type: "minPrice", label: `Min: $${minPrice}`, value: minPrice }] : []),
    ...(maxPrice ? [{ type: "maxPrice", label: `Max: $${maxPrice}`, value: maxPrice }] : []),
    ...(inStock ? [{ type: "inStock", label: "In Stock", value: "true" }] : []),
  ];

  return (
    <div className="bg-white">
      {/* Breadcrumb & Header */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Products</h1>
              <p className="text-muted-foreground mt-1">Browse our complete collection of premium footwear</p>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {activeFilters.map((filter, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                  <span>{filter.label}</span>
                  <button
                    onClick={() => {
                      if (filter.type === "search") setSearchQuery("");
                      if (filter.type === "brand") setBrandFilter("");
                      if (filter.type === "minPrice") setMinPrice("");
                      if (filter.type === "maxPrice") setMaxPrice("");
                      if (filter.type === "inStock") setInStock(false);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setBrandFilter("");
                    setMinPrice("");
                    setMaxPrice("");
                    setInStock(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block space-y-8">
            {/* Search */}
            <div>
              <h3 className="mb-4 font-semibold text-lg">Search</h3>
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="mb-4 font-semibold text-lg">Brand</h3>
              <div className="space-y-3">
                {brands.map((brand) => (
                  <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="brand"
                      value={brand.id}
                      checked={brandFilter === brand.id}
                      onChange={(e) =>
                        setBrandFilter(e.target.checked ? e.target.value : "")
                      }
                      className="w-4 h-4 rounded accent-accent"
                    />
                    <span className="text-sm group-hover:text-accent transition-colors">{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter (placeholder) */}
            <div>
              <h3 className="mb-4 font-semibold text-lg">Price Range (AUD)</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Price</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Price</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="mb-4 font-semibold text-lg">Availability</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 rounded accent-accent"
                />
                <span className="text-sm group-hover:text-accent transition-colors">In Stock</span>
              </label>
            </div>
          </aside>

        {/* Products Grid */}
        <div>
          {/* Sort and Result Count */}
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <p className="text-sm font-medium">
              {loading ? "Loading..." : error ? "0 products" : `${productsData?.total || 0} products`}
            </p>
            <select
              className="rounded-md border px-3 py-2 text-sm font-medium bg-white hover:bg-muted transition-colors"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="mb-2 h-3 w-20 bg-muted animate-pulse rounded" />
                    <div className="mb-3 h-5 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button variant="outline" onClick={() => fetchProducts()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && productsData?.products && productsData.products.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {productsData.products.map((product) => {
                  const effectivePrice = getEffectivePrice(product);
                  const originalPrice = getOriginalPrice(product);
                  const onSale = hasSale(product);
                  const primaryImage = product.images.find((img) => img.is_primary);

                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      brand={product.brand.name}
                      price={originalPrice}
                      salePrice={effectivePrice < originalPrice ? effectivePrice : null}
                      image={primaryImage ? { url: primaryImage.url, alt: primaryImage.alt_text } : undefined}
                      onSale={onSale}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                      .map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && (!productsData?.products || productsData.products.length === 0) && (
            <div className="rounded-lg border-2 border-dashed p-12 text-center">
              <p className="text-muted-foreground font-medium mb-4">No products found</p>
              <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters or search query</p>
              {(searchQuery || brandFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setBrandFilter("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

