import { NextRequest, NextResponse } from "next/server";
import { WishlistService } from "@/lib/services/wishlist.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "User not authenticated" },
        { status: 401 }
      );
    }

    const result = await WishlistService.getWishlist(data.user.id);

    if ("code" in result) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/v1/wishlist:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}
