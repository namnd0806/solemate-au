import { NextRequest, NextResponse } from "next/server";
import { CheckoutService } from "@/lib/services/checkout.service";

export async function PATCH(req: NextRequest) {
  try {
    const { checkout_id, method } = await req.json();

    if (!checkout_id || !method) {
      return NextResponse.json(
        { error: "checkout_id and method required" },
        { status: 400 }
      );
    }

    if (!["CARD", "PAYPAL", "AFTERPAY", "COD"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const result = await CheckoutService.updatePaymentMethod(
      checkout_id,
      method
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: "Payment method updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment method update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
