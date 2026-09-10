import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/lib/services/cart.service";
import { z } from "zod";

const promotionSchema = z.object({
  cart_id: z.string().uuid(),
  code: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_id, code } = promotionSchema.parse(body);

    const result = await CartService.applyPromotion(cart_id, code);

    if ("code" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: error.message },
        { status: 400 }
      );
    }
    console.error("POST /api/v1/cart/promotion:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to apply promotion" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cart_id");

    if (!cartId) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "cart_id required" },
        { status: 400 }
      );
    }

    const result = await CartService.removePromotion(cartId);

    if ("code" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/v1/cart/promotion:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to remove promotion" },
      { status: 500 }
    );
  }
}

