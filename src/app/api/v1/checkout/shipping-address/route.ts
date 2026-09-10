import { NextRequest, NextResponse } from "next/server";
import { CheckoutService } from "@/lib/services/checkout.service";

export async function PATCH(req: NextRequest) {
  try {
    const { checkout_id, address } = await req.json();

    if (!checkout_id || !address) {
      return NextResponse.json(
        { error: "checkout_id and address required" },
        { status: 400 }
      );
    }

    const result = await CheckoutService.updateShippingAddress(
      checkout_id,
      address
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: "Shipping address updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Shipping address update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
