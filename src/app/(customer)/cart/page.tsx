"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  }, []);

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
    return <div className="py-12 text-center">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Your Cart is Empty</h1>
          <p className="mb-6 text-muted-foreground">
            Continue shopping to add items to your cart
          </p>
          <Button asChild>
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => {
              const effectivePrice = getEffectivePrice(item);
              const originalPrice = getOriginalPrice(item);
              const onSale = hasSale(item);

              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      {item.image_url && (
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-muted">
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
                            className="font-semibold hover:underline"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {item.colour} / {item.size}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
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
                        >
                          Remove
                        </Button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQty(item.id, Math.max(1, item.qty - 1))
                            }
                            className="px-2 py-1 hover:bg-muted"
                          >
                            −
                          </button>
                          <span className="w-8 text-center">{item.qty}</span>
                          <button
                            onClick={() =>
                              handleUpdateQty(
                                item.id,
                                Math.min(item.qty + 1, item.stock_qty)
                              )
                            }
                            className="px-2 py-1 hover:bg-muted"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-sm font-semibold">
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
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Promotion */}
              <div className="space-y-2">
                {cart.promotion_code ? (
                  <div className="flex items-center justify-between rounded bg-green-50 p-2">
                    <Badge variant="secondary">{cart.promotion_code}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromo}
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
                    />
                    <Button
                      onClick={handleApplyPromo}
                      disabled={!promoCode || applyingPromo}
                      variant="outline"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>

                {cart.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−${cart.discount_amount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
