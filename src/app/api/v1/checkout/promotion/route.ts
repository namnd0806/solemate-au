import { NextRequest, NextResponse } from "next/server";
import { PromotionService } from "@/lib/services/promotion.service";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { checkout_id, code } = await req.json();

    if (!checkout_id || !code) {
      return NextResponse.json(
        { error: "checkout_id and code required" },
        { status: 400 }
      );
    }

    // Get checkout session
    const { data: session, error: sessionError } = await getSupabase()
      .from("checkout_sessions")
      .select("*, carts(cart_items(qty, product_variants(sale_price, price)))")
      .eq("id", checkout_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Checkout session not found" },
        { status: 404 }
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
    }

    const cart = session.carts as Cart;
    if (cart?.cart_items) {
      for (const item of cart.cart_items) {
        const effectivePrice =
          item.product_variants.sale_price ?? item.product_variants.price;
        subtotal += effectivePrice * item.qty;
      }
    }

    // Validate and apply promotion
    const result = await PromotionService.validateAndApplyPromotion(
      code,
      subtotal
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Update checkout session with promotion
    const { error: updateError } = await getSupabase()
      .from("checkout_sessions")
      .update({
        promotion_id: result.id,
      })
      .eq("id", checkout_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to apply promotion" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        promotion: {
          code: result.code,
          type: result.type,
          value: result.value,
          discount_amount: result.discount_amount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Apply promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const checkout_id = searchParams.get("checkout_id");

    if (!checkout_id) {
      return NextResponse.json(
        { error: "checkout_id required" },
        { status: 400 }
      );
    }

    // Remove promotion from checkout
    const { error } = await getSupabase()
      .from("checkout_sessions")
      .update({ promotion_id: null })
      .eq("id", checkout_id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to remove promotion" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Promotion removed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
