"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Step Into Style
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Discover premium footwear from the world&apos;s leading brands. Free shipping on orders over $150 AUD.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {!loading && homeData?.featured_products && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Button variant="link" asChild>
                <Link href="/products">View All</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {homeData.featured_products.map((product) => {
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
          </div>
        </section>
      )}

      {/* Brands */}
      {!loading && homeData?.brands && (
        <section className="border-t bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">Shop by Brand</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {homeData.brands.slice(0, 5).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand_id=${brand.id}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
