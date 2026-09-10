import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "@/lib/services/admin.service";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const variantData = await req.json();

    if (!variantData.product_id || !variantData.sku || variantData.price === undefined) {
      return NextResponse.json(
        { error: "product_id, sku, and price required" },
        { status: 400 }
      );
    }

    const result = await AdminService.createVariant(user.id, variantData);

    if (!result.success) {
      return NextResponse.json(result, { status: 403 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create variant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
