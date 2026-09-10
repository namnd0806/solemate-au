import { NextRequest, NextResponse } from "next/server";
import { CheckoutService } from "@/lib/services/checkout.service";

export async function POST(req: NextRequest) {
  try {
    const { checkout_id } = await req.json();

    if (!checkout_id) {
      return NextResponse.json(
        { error: "checkout_id required" },
        { status: 400 }
      );
    }

    // Get checkout session
    const session = await CheckoutService.getCheckoutSession(checkout_id);

    if (!session) {
      return NextResponse.json(
        { error: "Checkout session not found or expired" },
        { status: 404 }
      );
    }

    if (!session.shipping_address_json) {
      return NextResponse.json(
        { error: "Shipping address not set" },
        { status: 400 }
      );
    }

    // Calculate cart subtotal
    const { data: cart, error: cartError } = await (await import(
      "@supabase/supabase-js"
    ))
      .createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      .from("carts")
      .select(
        `
        cart_items (
          qty,
          product_variants (
            sale_price,
            price
          )
        ),
        promotion_id
      `
      )
      .eq("id", session.cart_id)
      .single();

    if (cartError || !cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Calculate subtotal
    let subtotal = 0;
    interface CartItemVariant {
      sale_price: number | null;
      price: number;
    }
    interface CartItemEntry {
      qty: number;
      product_variants: CartItemVariant;
    }

    const cartItems = (cart.cart_items as unknown as CartItemEntry[]);
    for (const item of cartItems) {
      const effectivePrice = item.product_variants.sale_price ?? item.product_variants.price;
      subtotal += effectivePrice * item.qty;
    }

    // Get shipping quotes
    const quotes = CheckoutService.getShippingQuotes(
      session.shipping_address_json,
      subtotal
    );

    return NextResponse.json(
      { quotes, subtotal },
      { status: 200 }
    );
  } catch (error) {
    console.error("Shipping quote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
