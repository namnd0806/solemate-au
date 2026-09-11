"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";

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

interface HomeData {
  featured_products: Product[];
  sale_products?: Product[];
  categories: Array<{ id: string; name: string; slug: string }>;
  brands: Array<{ id: string; name: string; slug: string }>;
}

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await fetch("/api/v1/home");
        if (res.ok) {
          setHomeData(await res.json());
        }
      } catch {
        console.error("Failed to fetch home data");
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full Width with CTA */}
      <section className="relative bg-gradient-to-r from-accent/20 to-accent/10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Step Into Style
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground">
              Discover premium footwear from the world&apos;s leading brands. Elevate your sole with our curated collection.
            </p>
            <p className="mb-8 inline-block rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              Free shipping on orders over $150 AUD
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products?sort=newest">New Arrivals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {!loading && homeData?.featured_products && homeData.featured_products.length > 0 && (
        <section className="border-b bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex items-baseline justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Featured Collection</h2>
                <p className="mt-2 text-muted-foreground">Hand-picked selection of premium styles</p>
              </div>
              <Button variant="link" className="text-accent hover:text-accent/80" asChild>
                <Link href="/products">View All →</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {homeData.featured_products.slice(0, 8).map((product) => {
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
                    salePrice={onSale && effectivePrice < originalPrice ? effectivePrice : null}
                    image={primaryImage ? { url: primaryImage.url, alt: primaryImage.alt_text } : undefined}
                    onSale={onSale}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Sale Section */}
      {!loading && homeData?.sale_products && homeData.sale_products.length > 0 && (
        <section className="border-b bg-accent/5 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex items-baseline justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">On Sale</h2>
                <p className="mt-2 text-muted-foreground">Limited time offers on premium footwear</p>
              </div>
              <Button variant="link" className="text-accent hover:text-accent/80" asChild>
                <Link href="/products?on_sale=true">Shop Sale →</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {homeData.sale_products.slice(0, 4).map((product) => {
                const effectivePrice = getEffectivePrice(product);
                const originalPrice = getOriginalPrice(product);
                const onSale = hasSale(product);
                const primaryImage = product.images.find((img) => img.is_primary);
                const discount = onSale && originalPrice > 0
                  ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
                  : 0;

                return (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <Card className="group overflow-hidden transition-all hover:shadow-lg">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        {primaryImage && (
                          <Image
                            src={primaryImage.url}
                            alt={primaryImage.alt_text || product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        {discount > 0 && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-destructive text-white">-{discount}%</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <p className="mb-1 text-xs text-muted-foreground uppercase font-medium">
                          {product.brand.name}
                        </p>
                        <h3 className="mb-3 font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-lg text-accent">
                            ${effectivePrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ${originalPrice.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Brands Section */}
      {!loading && homeData?.brands && homeData.brands.length > 0 && (
        <section className="border-b py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">Shop by Brand</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {homeData.brands.slice(0, 10).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand_id=${brand.id}`}
                  className="flex items-center justify-center rounded-lg border border-border px-6 py-8 text-center font-semibold text-foreground transition-all hover:border-accent hover:bg-accent/5 hover:text-accent"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-foreground py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold">Find Your Perfect Fit</h2>
          <p className="mb-8 text-lg text-white/80">
            Browse our complete collection of premium footwear curated for every style and occasion.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/products">Explore All Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
