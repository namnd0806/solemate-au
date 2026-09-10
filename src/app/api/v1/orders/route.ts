import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order.service";
import { PaymentService } from "@/lib/services/payment.service";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency-Key header required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { checkout_id, payment_method, card_payload } = body;

    if (!checkout_id || !payment_method) {
      return NextResponse.json(
        { error: "checkout_id and payment_method required" },
        { status: 400 }
      );
    }

    // 1. Place order (with idempotency check)
    const orderResult = await OrderService.placeOrder({
      checkout_id,
      payment_method,
      idempotency_key: idempotencyKey,
      card_payload,
    });

    if (!orderResult.success) {
      return NextResponse.json(orderResult, { status: 400 });
    }

    const { order_id, payment_id, total } = orderResult;

    if (!total) {
      return NextResponse.json(
        { error: "Order total not calculated" },
        { status: 400 }
      );
    }

    // 2. Simulate payment based on method
    interface PaymentResult {
      success: boolean;
      provider_ref?: string;
      last4?: string;
      error?: string;
      error_code?: string;
    }

    let paymentResult: PaymentResult | undefined;

    if (payment_method === "CARD") {
      if (!card_payload) {
        return NextResponse.json(
          { error: "Card payload required for CARD payment", error_code: "CARD_PAYLOAD_MISSING" },
          { status: 400 }
        );
      }

      paymentResult = await PaymentService.simulateCardPayment(
        card_payload,
        total
      );
    } else if (payment_method === "PAYPAL") {
      paymentResult = await PaymentService.simulatePayPalPayment();
    } else if (payment_method === "AFTERPAY") {
      paymentResult = await PaymentService.simulateAfterpayPayment();
    } else if (payment_method === "COD") {
      paymentResult = await PaymentService.simulateCODPayment();
    }

    // 3. Update payment record with result
    let paymentStatus = "INITIATED";
    let orderStatus = "PENDING";

    if (paymentResult && paymentResult.success) {
      if (payment_method === "COD") {
        paymentStatus = "PENDING_COLLECTION";
      } else {
        paymentStatus = "SUCCESS";
        orderStatus = "PROCESSING";
      }
    } else {
      paymentStatus = "DECLINED";
      orderStatus = "PENDING";
    }

    const { error: paymentUpdateError } = await getSupabase()
      .from("payments")
      .update({
        status: paymentStatus,
        provider_ref: paymentResult?.provider_ref,
        last4: paymentResult?.last4,
      })
      .eq("id", payment_id);

    if (paymentUpdateError) {
      console.error("Payment update error:", paymentUpdateError);
    }

    // 4. Update order status based on payment
    const { error: orderUpdateError } = await getSupabase()
      .from("orders")
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
      })
      .eq("id", order_id);

    if (orderUpdateError) {
      console.error("Order status update error:", orderUpdateError);
    }

    // 5. Mark cart as converted if payment succeeded
    const { data: checkout } = await getSupabase()
      .from("checkout_sessions")
      .select("cart_id")
      .eq("id", checkout_id)
      .single();

    if (checkout && paymentResult?.success) {
      await getSupabase()
        .from("carts")
        .update({ converted_at: new Date().toISOString() })
        .eq("id", checkout.cart_id);
    }

    // 6. Delete checkout session
    await getSupabase()
      .from("checkout_sessions")
      .delete()
      .eq("id", checkout_id);

    // Return response based on payment result
    if (!paymentResult?.success) {
      return NextResponse.json(
        {
          success: false,
          order_id,
          payment_status: paymentStatus,
          error: paymentResult?.error,
          error_code: paymentResult?.error_code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order_id,
        order_no: orderResult.order_no,
        payment_id,
        total: orderResult.total,
        payment_status: paymentStatus,
        order_status: orderStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Place order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const offset = (page - 1) * limit;

    const { data: orders, error } = await getSupabase()
      .from("orders")
      .select(
        `
        id,
        order_no,
        status,
        payment_status,
        subtotal,
        discount,
        shipping_fee,
        total,
        created_at,
        order_items(sku_snapshot, name_snapshot, qty, unit_price)
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        orders,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
