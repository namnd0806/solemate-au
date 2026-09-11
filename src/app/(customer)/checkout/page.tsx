"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Address {
  full_name: string;
  phone: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
}

interface ShippingQuote {
  method: string;
  fee: number;
  estimated_days: number;
}

interface CheckoutSession {
  id: string;
  cart_id: string;
  subtotal: number;
  discount_amount: number;
  promotion_id: string | null;
  promotion_code: string | null;
  shipping_address: Address | null;
  shipping_method: string | null;
  shipping_fee: number;
  payment_method: string | null;
}

interface CheckoutSummary {
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  shipping_method: string | null;
}

const STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"];

export default function CheckoutPage() {
  const router = useRouter();
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [address, setAddress] = useState<Address>({
    full_name: "",
    phone: "",
    street: "",
    suburb: "",
    state: "NSW",
    postcode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const initCheckout = async () => {
      try {
        const res = await fetch("/api/v1/checkout/init", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setCheckout(data);
        } else {
          setError("Failed to initialize checkout");
        }
      } catch {
        setError("Error initializing checkout");
      } finally {
        setLoading(false);
      }
    };
    initCheckout();
  }, []);

  const updateAddress = async () => {
    if (!checkout) return;

    try {
      const res = await fetch("/api/v1/checkout/shipping-address", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout_id: checkout.id,
          address,
        }),
      });

      if (res.ok) {
        await getShippingQuotes();
        setStep(2);
      } else {
        setError("Failed to save address");
      }
    } catch {
      setError("Error saving address");
    }
  };

  const getShippingQuotes = async () => {
    if (!checkout) return;

    try {
      const res = await fetch("/api/v1/checkout/shipping-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkout_id: checkout.id }),
      });

      if (res.ok) {
        const quotes = await res.json();
        setShippingQuotes(quotes);
      }
    } catch {
      setError("Error fetching shipping quotes");
    }
  };

  const selectShippingMethod = async (method: string, fee: number) => {
    if (!checkout) return;

    try {
      const res = await fetch("/api/v1/checkout/shipping-method", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout_id: checkout.id,
          method,
          fee,
        }),
      });

      if (res.ok) {
        await fetchSummary();
        setStep(3);
      }
    } catch {
      setError("Error selecting shipping method");
    }
  };

  const selectPaymentMethod = async (method: string) => {
    if (!checkout) return;

    try {
      const res = await fetch("/api/v1/checkout/payment-method", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout_id: checkout.id,
          method,
        }),
      });

      if (res.ok) {
        setPaymentMethod(method);
        setStep(4);
      }
    } catch {
      setError("Error selecting payment method");
    }
  };

  const fetchSummary = async () => {
    if (!checkout) return;

    try {
      const res = await fetch(
        `/api/v1/checkout/summary?checkout_id=${checkout.id}`
      );
      if (res.ok) {
        setSummary(await res.json());
      }
    } catch {
      setError("Error fetching summary");
    }
  };

  const completeCheckout = async () => {
    if (!checkout || !summary) return;

    setProcessing(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          checkout_id: checkout.id,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        router.push(`/checkout/confirmation/${order.id}`);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Payment failed");
      }
    } catch {
      setError("Error completing checkout");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading checkout...</div>
      </div>
    );
  }

  if (error && step === 1) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button asChild>
            <Link href="/cart">Back to Cart</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Checkout</h1>
        <p className="mb-8 text-muted-foreground">Step {step} of 4</p>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Step 1: Address */}
            <Card
              className={`transition-all ${step < 1 ? "opacity-50" : step === 1 ? "ring-2 ring-accent" : ""}`}
            >
              <CardHeader className={step !== 1 ? "border-b" : ""}>
                <CardTitle className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white ${step >= 1 ? "bg-accent" : "bg-muted text-muted-foreground"}`}>
                    {step > 1 ? "✓" : "1"}
                  </span>
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={step !== 1 ? "hidden" : "space-y-4"}>
                {error && step === 1 && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <Input
                    placeholder="Full Name"
                    value={address.full_name}
                    onChange={(e) =>
                      setAddress({ ...address, full_name: e.target.value })
                    }
                    className="h-10"
                  />
                  <Input
                    placeholder="Phone (10 digits)"
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    className="h-10"
                  />
                  <Input
                    placeholder="Street Address"
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="h-10"
                  />
                  <Input
                    placeholder="Suburb"
                    value={address.suburb}
                    onChange={(e) =>
                      setAddress({ ...address, suburb: e.target.value })
                    }
                    className="h-10"
                  />
                  <select
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="w-full h-10 rounded-md border px-3 py-2 bg-white"
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Postcode (4 digits)"
                    value={address.postcode}
                    onChange={(e) =>
                      setAddress({ ...address, postcode: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
                <Button
                  onClick={updateAddress}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold h-10"
                  disabled={!address.full_name || !address.postcode}
                >
                  Continue to Shipping
                </Button>
              </CardContent>
              {step > 1 && (
                <CardContent className="text-sm text-muted-foreground border-t pt-4">
                  <p className="font-medium text-foreground mb-1">{address.full_name}</p>
                  <p>{address.street}, {address.suburb} {address.postcode}</p>
                </CardContent>
              )}
            </Card>

            {/* Step 2: Shipping Method */}
            <Card className={`transition-all ${step < 2 ? "opacity-50" : step === 2 ? "ring-2 ring-accent" : ""}`}>
              <CardHeader className={step !== 2 ? "border-b" : ""}>
                <CardTitle className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white ${step >= 2 ? "bg-accent" : "bg-muted text-muted-foreground"}`}>
                    {step > 2 ? "✓" : "2"}
                  </span>
                  <span>Shipping Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={step !== 2 ? "hidden" : "space-y-3 pt-6"}>
                {shippingQuotes.map((quote) => (
                  <button
                    key={quote.method}
                    onClick={() =>
                      selectShippingMethod(quote.method, quote.fee)
                    }
                    className="w-full rounded-lg border-2 border-border p-4 text-left font-medium transition-all hover:border-accent hover:bg-accent/5 flex justify-between items-center"
                  >
                    <span>
                      {quote.method} • {quote.estimated_days} business days
                    </span>
                    <span className="text-accent font-bold">${quote.fee.toFixed(2)}</span>
                  </button>
                ))}
              </CardContent>
              {step > 2 && summary && (
                <CardContent className="text-sm text-muted-foreground border-t pt-4">
                  <p><span className="font-medium text-foreground">{summary.shipping_method}</span> • ${summary.shipping_fee.toFixed(2)}</p>
                </CardContent>
              )}
            </Card>

            {/* Step 3: Payment Method */}
            <Card className={`transition-all ${step < 3 ? "opacity-50" : step === 3 ? "ring-2 ring-accent" : ""}`}>
              <CardHeader className={step !== 3 ? "border-b" : ""}>
                <CardTitle className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white ${step >= 3 ? "bg-accent" : "bg-muted text-muted-foreground"}`}>
                    {step > 3 ? "✓" : "3"}
                  </span>
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={step !== 3 ? "hidden" : "space-y-3 pt-6"}>
                {["CARD", "PAYPAL", "AFTERPAY", "COD"].map((method) => (
                  <button
                    key={method}
                    onClick={() => selectPaymentMethod(method)}
                    className={`w-full rounded-lg border-2 p-4 font-medium text-left transition-all ${
                      paymentMethod === method
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    {method === "CARD" && "💳 Credit/Debit Card"}
                    {method === "PAYPAL" && "🅿️ PayPal"}
                    {method === "AFTERPAY" && "📦 Afterpay"}
                    {method === "COD" && "🚚 Cash on Delivery"}
                  </button>
                ))}
              </CardContent>
              {step > 3 && (
                <CardContent className="text-sm text-muted-foreground border-t pt-4">
                  <p className="font-medium text-foreground">{paymentMethod}</p>
                </CardContent>
              )}
            </Card>

            {/* Step 4: Review & Pay */}
            {step >= 4 && (
              <Card className="ring-2 ring-accent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white bg-accent">
                      4
                    </span>
                    <span>Review & Place Order</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Please review your order details before completing payment.
                  </p>
                  <Button
                    onClick={completeCheckout}
                    disabled={processing}
                    className="w-full bg-accent hover:bg-accent/90 text-white font-semibold h-10"
                    size="lg"
                  >
                    {processing ? "Processing..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          {summary && (
            <Card className="lg:sticky lg:top-4 lg:shadow-lg h-fit">
              <CardHeader className="border-b">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3 border-b pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${summary.subtotal.toFixed(2)}</span>
                  </div>
                  {summary.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Discount</span>
                      <span>−${summary.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${summary.shipping_fee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">${summary.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
