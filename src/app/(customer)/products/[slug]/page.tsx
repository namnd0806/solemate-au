"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Truck, RotateCcw } from "lucide-react";

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
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
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
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Product not found</div>
      </div>
    );
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

  const discount = onSale && originalPrice > 0
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;

  const displayImages = product.images.length > 0 ? product.images : [];
  const mainImage = displayImages[selectedImageIdx] || displayImages[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {mainImage && (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt_text || product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {onSale && discount > 0 && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-accent text-white text-base px-3 py-1">
                      -{discount}%
                    </Badge>
                  </div>
                )}
              </div>
            )}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      selectedImageIdx === idx
                        ? "border-accent"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt_text || product.name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {product.brand.name}
              </p>
              <h1 className="text-4xl font-bold mb-3">{product.name}</h1>
              {product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((cat) => (
                    <Badge key={cat.id} variant="outline">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-4xl font-bold text-accent">
                  ${effectivePrice.toFixed(2)}
                </span>
                {onSale && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {selectedVariant && selectedVariant.stock_qty > 0 ? (
                <p className="text-sm font-medium text-green-600">✓ In Stock</p>
              ) : (
                <p className="text-sm font-medium text-red-600">Out of Stock</p>
              )}
            </div>

            {/* Description */}
            <p className="text-foreground/80 leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selection Card */}
            <Card className="border">
              <CardContent className="pt-6 space-y-6">
                {/* Colour Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Colour</label>
                  <div className="flex flex-wrap gap-2">
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
                        className={`px-4 py-2 rounded-md border-2 font-medium transition-all ${
                          selectedColour === colour
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50 text-foreground"
                        }`}
                      >
                        {colour}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Size (AU/US)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-1 rounded-md border-2 font-medium transition-all text-sm ${
                          selectedSize === size
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50 text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Quantity</label>
                  <div className="flex items-center gap-2 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 border rounded-md hover:bg-muted transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            quantity + 1,
                            selectedVariant?.stock_qty || 1
                          )
                        )
                      }
                      className="px-3 py-2 border rounded-md hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* SKU */}
                {selectedVariant && (
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    SKU: <span className="font-mono">{selectedVariant.sku}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
                disabled={!selectedVariant || selectedVariant.stock_qty === 0 || addingToCart}
                onClick={handleAddToCart}
              >
                {addingToCart ? "Adding to Cart..." : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full font-semibold"
                disabled={!selectedVariant || addingToWishlist}
                onClick={handleAddToWishlist}
              >
                <Heart className="h-4 w-4 mr-2" />
                {addingToWishlist ? "Adding..." : "Add to Wishlist"}
              </Button>
            </div>

            {/* Shipping & Returns Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex gap-3">
                <Truck className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">On orders over $150 AUD</p>
                </div>
              </div>
              <div className="flex gap-3">
                <RotateCcw className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">30-Day Returns</h3>
                  <p className="text-sm text-muted-foreground">Easy returns for peace of mind</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
