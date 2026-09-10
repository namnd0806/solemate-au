"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Variant {
  id: string;
  sku: string;
  colour: string;
  size: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: { name: string; slug: string };
  variants: Variant[];
  images: Array<{
    id: string;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColour, setSelectedColour] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/v1/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);

          if (data.variants && data.variants.length > 0) {
            const activeVariants = data.variants.filter(
              (v: Variant) => v.status === "ACTIVE" && v.stock_qty > 0
            );
            if (activeVariants.length > 0) {
              setSelectedColour(activeVariants[0].colour);
              setSelectedSize(activeVariants[0].size);
            }
          }
        }
      } catch {
        console.error("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setAddingToCart(true);
    try {
      const res = await fetch("/api/v1/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: selectedVariant.id,
          qty: quantity,
        }),
      });

      if (res.ok) {
        setQuantity(1);
      } else if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(`/products/${slug}`)}`);
      }
    } catch {
      console.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedVariant) return;

    setAddingToWishlist(true);
    try {
      const res = await fetch("/api/v1/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: selectedVariant.id }),
      });

      if (res.status === 201 || res.ok) {
        alert("Added to wishlist!");
      } else if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(`/products/${slug}`)}`);
      }
    } catch {
      console.error("Failed to add to wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center">Loading product...</div>;
  }

  if (!product) {
    return <div className="py-12 text-center">Product not found</div>;
  }

  const activeVariants = product.variants.filter(
    (v) => v.status === "ACTIVE" && v.stock_qty > 0
  );

  const colours = Array.from(
    new Set(activeVariants.map((v) => v.colour))
  );

  const sizes = activeVariants
    .filter((v) => v.colour === selectedColour)
    .map((v) => v.size);

  const selectedVariant = activeVariants.find(
    (v) => v.colour === selectedColour && v.size === selectedSize
  );

  const effectivePrice = selectedVariant
    ? selectedVariant.sale_price !== null
      ? selectedVariant.sale_price
      : selectedVariant.price
    : 0;

  const originalPrice = selectedVariant?.price || 0;
  const onSale =
    selectedVariant &&
    selectedVariant.sale_price &&
    selectedVariant.sale_price < selectedVariant.price;

  const primaryImage = product.images.find((img) => img.is_primary);
  const allImages = product.images.length > 0 ? product.images : [primaryImage];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          {allImages.map((img) => (
            img && (
              <div key={img.id} className="relative aspect-square bg-muted overflow-hidden rounded-lg">
                <Image
                  src={img.url}
                  alt={img.alt_text || product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )
          ))}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              {product.brand.name}
            </p>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            {product.categories.length > 0 && (
              <div className="flex gap-2">
                {product.categories.map((cat) => (
                  <Badge key={cat.id} variant="outline">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                ${effectivePrice.toFixed(2)}
              </span>
              {onSale && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <Badge variant="destructive">
                    -{Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>
            {selectedVariant && selectedVariant.stock_qty > 0 ? (
              <p className="text-sm text-green-600">In Stock</p>
            ) : (
              <p className="text-sm text-red-600">Out of Stock</p>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground">{product.description}</p>

          {/* Variant Selection */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Colour Selection */}
                <div>
                  <h3 className="mb-3 font-semibold">Colour</h3>
                  <div className="flex gap-2">
                    {colours.map((colour) => (
                      <button
                        key={colour}
                        onClick={() => {
                          setSelectedColour(colour);
                          const newVariant = activeVariants.find(
                            (v) => v.colour === colour
                          );
                          if (newVariant) {
                            setSelectedSize(newVariant.size);
                          }
                        }}
                        className={`px-4 py-2 border rounded-md transition-colors ${
                          selectedColour === colour
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        {colour}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <h3 className="mb-3 font-semibold">Size</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 border rounded-md transition-colors ${
                          selectedSize === size
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="mb-3 font-semibold">Quantity</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 border rounded-md hover:bg-muted"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            quantity + 1,
                            selectedVariant?.stock_qty || 1
                          )
                        )
                      }
                      className="px-3 py-1 border rounded-md hover:bg-muted"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* SKU */}
                {selectedVariant && (
                  <p className="text-xs text-muted-foreground">
                    SKU: {selectedVariant.sku}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              disabled={!selectedVariant || selectedVariant.stock_qty === 0 || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              disabled={!selectedVariant || addingToWishlist}
              onClick={handleAddToWishlist}
            >
              {addingToWishlist ? "Adding..." : "♡ Add to Wishlist"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
