import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const checkout_id = searchParams.get("checkout_id");

    if (!checkout_id) {
      return NextResponse.json(
        { error: "checkout_id required" },
        { status: 400 }
      );
    }

    // Get checkout with all related data
    const { data: session, error: sessionError } = await getSupabase()
      .from("checkout_sessions")
      .select(
        `
        id,
        shipping_method,
        shipping_fee,
        promotion_id,
        expires_at,
        carts(
          id,
          cart_items(
            qty,
            product_variants(sale_price, price)
          ),
          promotions(id, code, type, value, min_spend)
        )
      `
      )
      .eq("id", checkout_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Checkout session not found" },
        { status: 404 }
      );
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Checkout session expired" },
        { status: 400 }
      );
    }

    // Calculate subtotal
    let subtotal = 0;
    interface CartItemVariant {
      sale_price: number | null;
      price: number;
    }
    interface CartItem {
      qty: number;
      product_variants: CartItemVariant;
    }
    interface Cart {
      cart_items?: CartItem[];
      promotions?: { id: string; code: string; type: string; value: number; min_spend: number };
    }

    const cart = session.carts as Cart;
    if (cart?.cart_items) {
      for (const item of cart.cart_items) {
        const effectivePrice =
          item.product_variants.sale_price ?? item.product_variants.price;
        subtotal += effectivePrice * item.qty;
      }
    }

    // Get discount from promotion if applied
    let discount = 0;
    if (session.promotion_id && cart?.promotions) {
      const promo = cart.promotions;
      if (promo.type === "PERCENT") {
        discount = (subtotal * promo.value) / 100;
      } else {
        discount = promo.value;
      }
      discount = Math.min(discount, subtotal);
    }

    const shippingFee = session.shipping_fee ?? 0;
    const total = subtotal - discount + shippingFee;

    return NextResponse.json(
      {
        checkout_id,
        subtotal,
        discount,
        shipping_fee: shippingFee,
        shipping_method: session.shipping_method,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
