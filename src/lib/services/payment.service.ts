import { createClient } from "@supabase/supabase-js";

export interface PaymentSimulatorResult {
  success: boolean;
  provider_ref?: string;
  last4?: string;
  error?: string;
  error_code?: string;
}

interface CardPayload {
  card_number: string;
  card_holder: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
}

export class PaymentService {
  static async simulateCardPayment(
    payload: CardPayload,
    amount: number
  ): Promise<PaymentSimulatorResult> {
    const { card_number, card_holder, exp_month, exp_year } = payload;

    if (!card_number || !card_holder || !exp_month || !exp_year) {
      return {
        success: false,
        error: "Card details incomplete",
        error_code: "CARD_INCOMPLETE",
      };
    }

    // Test cards (simulator rules)
    // 4111111111111111 -> SUCCESS
    // 4000000000000002 -> DECLINED
    const testCardSucceed = "4111111111111111";
    const testCardDecline = "4000000000000002";

    const last4 = card_number.slice(-4);
    const provider_ref = `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (card_number === testCardDecline) {
      return {
        success: false,
        error: "Card declined",
        error_code: "PAYMENT_DECLINED",
        last4,
        provider_ref,
      };
    }

    // Mock expiry validation
    const now = new Date();
    const expYear = parseInt(exp_year);
    const expMonth = parseInt(exp_month);

    if (
      expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
    ) {
      return {
        success: false,
        error: "Card expired",
        error_code: "CARD_EXPIRED",
        last4,
        provider_ref,
      };
    }

    return {
      success: true,
      provider_ref,
      last4,
    };
  }

  static async simulatePayPalPayment(): Promise<PaymentSimulatorResult> {
    // Mock PayPal payment - always succeeds in this simulator
    const provider_ref = `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      provider_ref,
    };
  }

  static async simulateAfterpayPayment(): Promise<PaymentSimulatorResult> {
    // Mock Afterpay - always succeeds in this simulator
    const provider_ref = `AFTERPAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      provider_ref,
    };
  }

  static async simulateCODPayment(): Promise<PaymentSimulatorResult> {
    // COD - no payment processing, just mark as pending collection
    const provider_ref = `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      provider_ref,
    };
  }

  static async recordPaymentTransaction(
    paymentId: string,
    eventType: string,
    status: string,
    amount: number,
    providerResponse?: Record<string, unknown>
  ): Promise<void> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from("payment_transactions").insert({
      payment_id: paymentId,
      event_type: eventType,
      status,
      amount,
      provider_response: providerResponse || {},
    });
  }
}
