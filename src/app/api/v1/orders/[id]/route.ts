import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = id;

    const { data: order, error } = await getSupabase()
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
        shipping_address_json,
        created_at,
        updated_at,
        order_items(
          id,
          sku_snapshot,
          name_snapshot,
          brand_snapshot,
          colour_snapshot,
          size_snapshot,
          unit_price,
          qty,
          line_total
        ),
        shipments(
          id,
          method,
          status,
          tracking_no,
          shipped_at,
          delivered_at
        ),
        payments(
          id,
          method,
          status,
          amount,
          last4,
          created_at
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Get order detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
