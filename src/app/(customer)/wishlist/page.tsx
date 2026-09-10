"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface WishlistItem {
  id: string;
  variant_id: string;
  product_name: string;
  variant_sku: string;
  colour: string;
  size: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  image_url: string | null;
}

interface Wishlist {
  id: string;
  user_id: string;
  items: WishlistItem[];
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/wishlist");
      if (res.ok) {
        setWishlist(await res.json());
      } else if (res.status === 401) {
        setWishlist(null);
      }
    } catch {
      console.error("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
        });
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWishlist();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/wishlist/items/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchWishlist();
      }
    } catch {
      console.error("Failed to remove wishlist item");
    }
  };

  const handleAddToCart = async (variantId: string) => {
    try {
      const res = await fetch("/api/v1/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId, qty: 1 }),
      });

      if (res.ok) {
        await handleRemoveItem(variantId);
      } else if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent("/wishlist")}`);
      }
    } catch {
      console.error("Failed to add to cart");
    }
  };

  if (loading) {
    return <div className="py-12 text-center">Loading wishlist...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Sign in to Your Wishlist</h1>
          <p className="mb-6 text-muted-foreground">
            Create an account to save your favorite items
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Your Wishlist is Empty</h1>
          <p className="mb-6 text-muted-foreground">
            Add items to your wishlist by clicking the heart icon
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getEffectivePrice = (item: WishlistItem) => {
    return item.sale_price !== null ? item.sale_price : item.price;
  };

  const getOriginalPrice = (item: WishlistItem) => {
    return item.price;
  };

  const hasSale = (item: WishlistItem) => {
    return item.sale_price && item.sale_price < item.price;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Wishlist</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.items.map((item) => {
          const effectivePrice = getEffectivePrice(item);
          const originalPrice = getOriginalPrice(item);
          const onSale = hasSale(item);
          const inStock = item.stock_qty > 0;

          return (
            <Card key={item.id} className="overflow-hidden">
              {/* Image */}
              {item.image_url && (
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <CardContent className="p-4">
                <Link
                  href={`/products/${item.variant_sku}`}
                  className="font-semibold hover:underline line-clamp-2"
                >
                  {item.product_name}
                </Link>

                <p className="text-sm text-muted-foreground">
                  {item.colour} / {item.size}
                </p>

                <div className="my-3 flex items-center gap-2">
                  <span className="font-bold">
                    ${effectivePrice.toFixed(2)}
                  </span>
                  {onSale && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!inStock}
                    onClick={() =>
                      handleAddToCart(item.variant_id)
                    }
                  >
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
