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

    const { variant_id, qty_delta, reason } = await req.json();

    if (!variant_id || qty_delta === undefined || !reason) {
      return NextResponse.json(
        { error: "variant_id, qty_delta, and reason required" },
        { status: 400 }
      );
    }

    const result = await AdminService.adjustStock(user.id, variant_id, qty_delta, reason);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
