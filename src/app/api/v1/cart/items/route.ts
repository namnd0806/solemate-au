import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/lib/services/cart.service";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const addItemSchema = z.object({
  variant_id: z.string().uuid(),
  qty: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variant_id, qty } = addItemSchema.parse(body);

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    let userId: string | undefined;
    let sessionKey: string | undefined;

    if (data.user) {
      userId = data.user.id;
    } else {
      const sessionCookie = request.cookies.get("session_key")?.value;
      if (!sessionCookie) {
        const newSessionKey = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const response = NextResponse.json(
          { code: "UNAUTHORIZED", message: "Session required" },
          { status: 401 }
        );
        response.cookies.set("session_key", newSessionKey, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        });
        return response;
      }
      sessionKey = sessionCookie;
    }

    const result = await CartService.addItem(variant_id, qty, userId, sessionKey);

    if ("code" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: error.message },
        { status: 400 }
      );
    }
    console.error("POST /api/v1/cart/items:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

