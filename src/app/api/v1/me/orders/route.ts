import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const offset = (page - 1) * limit;
    const status = searchParams.get("status");

    let query = supabase
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
        order_items(
          id,
          sku_snapshot,
          name_snapshot,
          colour_snapshot,
          size_snapshot,
          qty,
          unit_price,
          line_total
        ),
        shipments(
          id,
          method,
          status,
          tracking_no
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Fetch orders error:", error);
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
        total: count || 0,
        pages: count ? Math.ceil(count / limit) : 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get my orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
