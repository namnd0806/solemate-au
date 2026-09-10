import { createClient } from "@supabase/supabase-js";

interface PromotionErrorResponse {
  success: false;
  error_code: string;
  message: string;
}

interface PromotionValidResponse {
  success: true;
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  discount_amount: number;
}

export class PromotionService {
  private static getSupabase() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Validate and apply promotion code
   * Returns discount response or error
   */
  static async validateAndApplyPromotion(
    code: string,
    subtotal: number
  ): Promise<PromotionValidResponse | PromotionErrorResponse> {
    // Normalize code
    const normalizedCode = code.toUpperCase().trim();

    if (!normalizedCode) {
      return {
        success: false,
        error_code: "PROMO_CODE_REQUIRED",
        message: "Promotion code is required",
      };
    }

    if (normalizedCode.length > 50) {
      return {
        success: false,
        error_code: "PROMO_CODE_INVALID",
        message: "Promotion code is invalid",
      };
    }

    // Fetch promotion by code (case-insensitive)
    const { data: promotion, error: fetchError } = await this.getSupabase()
      .from("promotions")
      .select("*")
      .ilike("code", normalizedCode)
      .single();

    if (fetchError || !promotion) {
      return {
        success: false,
        error_code: "PROMO_CODE_NOT_FOUND",
        message: "Promotion code not found or expired",
      };
    }

    // Check if promotion is enabled
    if (!promotion.enabled) {
      return {
        success: false,
        error_code: "PROMO_CODE_DISABLED",
        message: "Promotion code is no longer active",
      };
    }

    const now = new Date();
    const startsAt = new Date(promotion.starts_at);
    const endsAt = new Date(promotion.ends_at);

    // Check if promotion has started
    if (now < startsAt) {
      return {
        success: false,
        error_code: "PROMO_NOT_STARTED",
        message: "Promotion code is not yet valid",
      };
    }

    // Check if promotion has expired
    if (now > endsAt) {
      return {
        success: false,
        error_code: "PROMO_EXPIRED",
        message: "Promotion code has expired",
      };
    }

    // Check minimum spend requirement
    if (promotion.min_spend && subtotal < promotion.min_spend) {
      return {
        success: false,
        error_code: "PROMO_MIN_SPEND_NOT_MET",
        message: `Minimum spend of $${promotion.min_spend.toFixed(2)} required`,
      };
    }

    // Check usage limit
    if (promotion.usage_limit) {
      const { count, error: countError } = await this.getSupabase()
        .from("promotion_usages")
        .select("*", { count: "exact", head: true })
        .eq("promotion_id", promotion.id);

      if (countError) {
        return {
          success: false,
          error_code: "PROMO_VALIDATION_ERROR",
          message: "Failed to validate promotion",
        };
      }

      if (count && count >= promotion.usage_limit) {
        return {
          success: false,
          error_code: "PROMO_USAGE_LIMIT_EXCEEDED",
          message: "Promotion code has reached usage limit",
        };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.type === "PERCENT") {
      discountAmount = (subtotal * promotion.value) / 100;
    } else {
      discountAmount = promotion.value;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      success: true,
      id: promotion.id,
      code: promotion.code,
      type: promotion.type,
      value: promotion.value,
      discount_amount: Math.round(discountAmount * 100) / 100,
    };
  }

  /**
   * Record promotion usage after order placement
   */
  static async recordPromotionUsage(
    promotionId: string,
    orderId: string,
    userId: string | null,
    discountAmount: number
  ) {
    const { error } = await this.getSupabase()
      .from("promotion_usages")
      .insert({
        promotion_id: promotionId,
        order_id: orderId,
        user_id: userId,
        discount_amount: discountAmount,
      });

    if (error) {
      throw new Error(`Failed to record promotion usage: ${error.message}`);
    }
  }
}
