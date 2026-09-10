import { NextRequest, NextResponse } from "next/server";
import { WishlistService } from "@/lib/services/wishlist.service";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const addItemSchema = z.object({
  variant_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { variant_id } = addItemSchema.parse(body);

    const result = await WishlistService.addItem(data.user.id, variant_id);

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
    console.error("POST /api/v1/wishlist/items:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to add item to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await WishlistService.removeItem(id);

    if ("code" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/v1/wishlist/items/[id]:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to remove item from wishlist" },
      { status: 500 }
    );
  }
}

