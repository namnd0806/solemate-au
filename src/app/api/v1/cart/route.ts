import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/lib/services/cart.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    let userId: string | undefined;
    let sessionKey: string | undefined;

    if (data.user) {
      userId = data.user.id;
    } else {
      const sessionCookie = request.cookies.get("session_key")?.value;
      if (sessionCookie) {
        sessionKey = sessionCookie;
      }
    }

    if (!userId && !sessionKey) {
      return NextResponse.json({ items: [], total: 0, cart_id: null }, { status: 200 });
    }

    const result = await CartService.getCart(userId, sessionKey);

    if ("code" in result) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/v1/cart:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
