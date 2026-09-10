import { createClient } from "@supabase/supabase-js";

interface ShippingAddress {
  full_name: string;
  phone: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
}

interface ShippingQuote {
  method: "STANDARD" | "EXPRESS";
  fee: number;
  days: number;
}

interface ServiceResult {
  success: boolean;
  error?: string;
}

export class CheckoutService {
  private static getSupabase() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  static async createCheckoutSession(cartId: string, userId: string | null) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const { data, error } = await this.getSupabase()
      .from("checkout_sessions")
      .insert({
        cart_id: cartId,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }

    return data;
  }

  /**
   * Get checkout session
   */
  static async getCheckoutSession(checkoutId: string) {
    const { data, error } = await this.getSupabase()
      .from("checkout_sessions")
      .select("*")
      .eq("id", checkoutId)
      .single();

    if (error) {
      return null;
    }

    // Check if session expired
    if (new Date(data.expires_at) < new Date()) {
      return null;
    }

    return data;
  }

  /**
   * Update shipping address snapshot
   */
  static async updateShippingAddress(
    checkoutId: string,
    address: ShippingAddress
  ): Promise<ServiceResult> {
    // Validate address fields
    if (
      !address.full_name ||
      !address.phone ||
      !address.street ||
      !address.suburb ||
      !address.state ||
      !address.postcode
    ) {
      return {
        success: false,
        error: "All address fields are required",
      };
    }

    // Validate postcode format (4 digits for AU)
    if (!/^\d{4}$/.test(address.postcode)) {
      return {
        success: false,
        error: "Invalid postcode format (must be 4 digits)",
      };
    }

    // Validate phone format (basic)
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ""))) {
      return {
        success: false,
        error: "Invalid phone number",
      };
    }

    const { error } = await this.getSupabase()
      .from("checkout_sessions")
      .update({
        shipping_address_json: address,
      })
      .eq("id", checkoutId);

    if (error) {
      return {
        success: false,
        error: "Failed to update shipping address",
      };
    }

    return { success: true };
  }

  /**
   * Get shipping quotes based on address and subtotal
   */
  static getShippingQuotes(
    address: ShippingAddress,
    subtotal: number
  ): ShippingQuote[] {
    // Simulate shipping quotes based on postcode (state)
    const state = address.state.toUpperCase();

    // Base rates by state
    const baseRates: Record<string, { standard: number; express: number }> = {
      NSW: { standard: 10, express: 20 },
      VIC: { standard: 10, express: 20 },
      QLD: { standard: 12, express: 25 },
      WA: { standard: 15, express: 30 },
      SA: { standard: 12, express: 25 },
      TAS: { standard: 15, express: 30 },
      NT: { standard: 18, express: 35 },
      ACT: { standard: 10, express: 20 },
    };

    const rates = baseRates[state] || { standard: 12, express: 25 };

    // Free shipping for orders over $100
    const standardFee = subtotal >= 100 ? 0 : rates.standard;
    const expressFee = subtotal >= 200 ? rates.express * 0.5 : rates.express;

    return [
      {
        method: "STANDARD",
        fee: Math.round(standardFee * 100) / 100,
        days: 5,
      },
      {
        method: "EXPRESS",
        fee: Math.round(expressFee * 100) / 100,
        days: 2,
      },
    ];
  }

  /**
   * Update shipping method and fee
   */
  static async updateShippingMethod(
    checkoutId: string,
    method: "STANDARD" | "EXPRESS",
    fee: number
  ): Promise<ServiceResult> {
    if (!["STANDARD", "EXPRESS"].includes(method)) {
      return {
        success: false,
        error: "Invalid shipping method",
      };
    }

    if (fee < 0) {
      return {
        success: false,
        error: "Shipping fee cannot be negative",
      };
    }

    const { error } = await this.getSupabase()
      .from("checkout_sessions")
      .update({
        shipping_method: method,
        shipping_fee: fee,
      })
      .eq("id", checkoutId);

    if (error) {
      return {
        success: false,
        error: "Failed to update shipping method",
      };
    }

    return { success: true };
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(
    checkoutId: string,
    method: "CARD" | "PAYPAL" | "AFTERPAY" | "COD"
  ): Promise<ServiceResult> {
    if (!["CARD", "PAYPAL", "AFTERPAY", "COD"].includes(method)) {
      return {
        success: false,
        error: "Invalid payment method",
      };
    }

    const { error } = await this.getSupabase()
      .from("checkout_sessions")
      .update({
        payment_method: method,
      })
      .eq("id", checkoutId);

    if (error) {
      return {
        success: false,
        error: "Failed to update payment method",
      };
    }

    return { success: true };
  }
}
