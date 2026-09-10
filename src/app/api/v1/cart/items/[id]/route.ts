import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/lib/services/cart.service";
import { z } from "zod";

const updateItemSchema = z.object({
  qty: z.number().int().positive(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { qty } = updateItemSchema.parse(body);

    const result = await CartService.updateItem(id, qty);

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
    console.error("PATCH /api/v1/cart/items/[id]:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await CartService.removeItem(id);

    if ("code" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/v1/cart/items/[id]:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}

