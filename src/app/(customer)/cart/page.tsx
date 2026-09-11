"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag } from "lucide-react";

interface CartItem {
  id: string;
  variant_id: string;
  qty: number;
  product_name: string;
  variant_sku: string;
  colour: string;
  size: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  image_url: string | null;
}

interface CartSummary {
  cart_id: string;
  items: CartItem[];
  total_qty: number;
  subtotal: number;
  promotion_id: string | null;
  promotion_code: string | null;
  discount_amount: number;
  total: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/cart");
      if (res.ok) {
        setCart(await res.json());
      }
    } catch {
      console.error("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    try {
      const res = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: newQty }),
      });

      if (res.ok) {
        await fetchCart();
      }
    } catch {
      console.error("Failed to update cart item");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCart();
      }
    } catch {
      console.error("Failed to remove cart item");
    }
  };

  const handleApplyPromo = async () => {
    if (!cart || !promoCode) return;

    setApplyingPromo(true);
    try {
      const res = await fetch("/api/v1/cart/promotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cart.cart_id, code: promoCode }),
      });

      if (res.ok) {
        setPromoCode("");
        await fetchCart();
      }
    } catch {
      console.error("Failed to apply promotion");
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    if (!cart) return;

    try {
      const res = await fetch(
        `/api/v1/cart/promotion?cart_id=${cart.cart_id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        await fetchCart();
      }
    } catch {
      console.error("Failed to remove promotion");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="mb-2 text-3xl font-bold">Your Cart is Empty</h1>
          <p className="mb-8 text-muted-foreground">
            Continue shopping to add items to your cart
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getEffectivePrice = (item: CartItem) => {
    return item.sale_price !== null ? item.sale_price : item.price;
  };

  const getOriginalPrice = (item: CartItem) => {
    return item.price;
  };

  const hasSale = (item: CartItem) => {
    return item.sale_price && item.sale_price < item.price;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mb-8 text-muted-foreground">{cart.total_qty} item{cart.total_qty !== 1 ? 's' : ''}</p>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => {
                const effectivePrice = getEffectivePrice(item);
                const originalPrice = getOriginalPrice(item);
                const onSale = hasSale(item);

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-4">
                        {/* Image */}
                        {item.image_url && (
                          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={item.image_url}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/products/${item.variant_sku}`}
                              className="font-semibold text-foreground hover:text-accent transition-colors"
                            >
                              {item.product_name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {item.colour} • Size {item.size}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-accent">
                              ${effectivePrice.toFixed(2)}
                            </span>
                            {onSale && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-2 border rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQty(item.id, Math.max(1, item.qty - 1))
                              }
                              className="px-2 py-1 hover:bg-muted font-medium"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold">{item.qty}</span>
                            <button
                              onClick={() =>
                                handleUpdateQty(
                                  item.id,
                                  Math.min(item.qty + 1, item.stock_qty)
                                )
                              }
                              className="px-2 py-1 hover:bg-muted font-medium"
                            >
                              +
                            </button>
                          </div>

                          <p className="text-base font-bold text-foreground">
                            ${(effectivePrice * item.qty).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Cart Summary */}
          <div>
            <Card className="sticky top-4 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Promotion */}
                <div className="space-y-2">
                  {cart.promotion_code ? (
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 border border-green-200">
                      <Badge className="bg-green-600">{cart.promotion_code}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromo}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="h-10"
                      />
                      <Button
                        onClick={handleApplyPromo}
                        disabled={!promoCode || applyingPromo}
                        variant="outline"
                        className="font-semibold"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                  </div>

                  {cart.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Discount</span>
                      <span>−${cart.discount_amount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">${cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-white font-semibold" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <Button size="lg" variant="outline" className="w-full font-semibold" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  ✓ Free shipping on orders over $150
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
