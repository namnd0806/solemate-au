"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Heart, ShoppingBag } from "lucide-react";

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
  }, [fetchWishlist]);

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
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading wishlist...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center w-full">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="mb-2 text-3xl font-bold">Save Your Favorites</h1>
          <p className="mb-8 text-muted-foreground">
            Sign in to your account to save and manage your wishlist
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-white" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="mb-2 text-3xl font-bold">Your Wishlist is Empty</h1>
          <p className="mb-8 text-muted-foreground">
            Add items to your wishlist by clicking the heart icon on product pages
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-white" asChild>
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-muted-foreground">{wishlist.items.length} item{wishlist.items.length !== 1 ? 's' : ''} saved</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.items.map((item) => {
            const effectivePrice = getEffectivePrice(item);
            const originalPrice = getOriginalPrice(item);
            const onSale = hasSale(item);
            const inStock = item.stock_qty > 0;

            return (
              <Card key={item.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative aspect-square bg-muted overflow-hidden group">
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  {onSale && (
                    <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">
                      Sale
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <Link
                    href={`/products/${item.variant_sku}`}
                    className="font-semibold hover:text-accent transition-colors line-clamp-2 text-sm"
                  >
                    {item.product_name}
                  </Link>

                  <p className="text-xs text-muted-foreground mt-1">
                    {item.colour} • Size {item.size}
                  </p>

                  <div className="my-3 flex items-center gap-2">
                    <span className="font-bold text-accent text-lg">
                      ${effectivePrice.toFixed(2)}
                    </span>
                    {onSale && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mt-auto">
                    <Button
                      size="sm"
                      className={`w-full font-semibold h-9 ${inStock ? "bg-accent hover:bg-accent/90 text-white" : "bg-muted text-muted-foreground"}`}
                      disabled={!inStock}
                      onClick={() => handleAddToCart(item.variant_id)}
                    >
                      {inStock ? (
                        <>
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Add to Cart
                        </>
                      ) : (
                        "Out of Stock"
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full font-semibold h-9"
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
    </div>
  );
}
