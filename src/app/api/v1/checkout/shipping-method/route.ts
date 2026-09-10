import { NextRequest, NextResponse } from "next/server";
import { CheckoutService } from "@/lib/services/checkout.service";

export async function PATCH(req: NextRequest) {
  try {
    const { checkout_id, method, fee } = await req.json();

    if (!checkout_id || !method || fee === undefined) {
      return NextResponse.json(
        { error: "checkout_id, method, and fee required" },
        { status: 400 }
      );
    }

    if (!["STANDARD", "EXPRESS"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid shipping method" },
        { status: 400 }
      );
    }

    const result = await CheckoutService.updateShippingMethod(
      checkout_id,
      method,
      fee
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: "Shipping method updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Shipping method update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
