import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data: order, error } = await supabase
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
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Get my order detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
