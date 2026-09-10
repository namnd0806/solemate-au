import { NextRequest, NextResponse } from "next/server";
import { CheckoutService } from "@/lib/services/checkout.service";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { cart_id } = await req.json();

    if (!cart_id) {
      return NextResponse.json(
        { error: "cart_id required" },
        { status: 400 }
      );
    }

    // Get auth context
    const authHeader = req.headers.get("authorization");
    let user_id: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await getSupabase().auth.getUser(token);
      user_id = user?.id || null;
    }

    // Create checkout session
    const session = await CheckoutService.createCheckoutSession(
      cart_id,
      user_id
    );

    if ("code" in session) {
      return NextResponse.json(session, { status: 400 });
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Checkout init error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
