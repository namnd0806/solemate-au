import { createClient } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/constants/errors";

export interface CartItem {
  id: string;
  variant_id: string;
  qty: number;
  product_name: string;
  variant_sku: string;
  colour: string;
  size: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  image_url: string | null;
}

export interface CartSummary {
  cart_id: string;
  items: CartItem[];
  total_qty: number;
  subtotal: number;
  promotion_id: string | null;
  promotion_code: string | null;
  discount_amount: number;
  total: number;
}

interface CartError {
  code: ErrorCode;
  message: string;
}

export class CartService {
  static async getCart(
    userId?: string,
    sessionKey?: string
  ): Promise<CartSummary | CartError> {
    try {
      const supabase = await createClient();

      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id, promotion_id")
        .eq("user_id", userId)
        .eq("status", "ACTIVE")
        .single();

      if (cartError && cartError.code !== "PGRST116") {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to fetch cart",
        };
      }

      if (!cart) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Cart not found",
        };
      }

      const { data: cartItems, error: itemsError } = await supabase
        .from("cart_items")
        .select(
          `
          id, qty, variant_id,
          product_variants (
            sku, colour, size, price, sale_price, stock_qty, status,
            products (name),
            product_images (url, is_primary)
          )
        `
        )
        .eq("cart_id", cart.id);

      if (itemsError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to fetch cart items",
        };
      }

      interface CartItemRow {
        id: string;
        qty: number;
        variant_id: string;
        product_variants: {
          sku: string;
          colour: string;
          size: string;
          price: number;
          sale_price: number | null;
          stock_qty: number;
          status: string;
          products: { name: string } | null;
          product_images: Array<{ url: string; is_primary: boolean }> | null;
        } | null;
      }

      const items: CartItem[] = ((cartItems || []) as unknown as CartItemRow[])
        .filter((item) => item.product_variants)
        .map((item) => {
          const variant = item.product_variants!;
          const primaryImage =
            variant.product_images?.find((img) => img.is_primary) ||
            variant.product_images?.[0];

          return {
            id: item.id,
            variant_id: item.variant_id,
            qty: item.qty,
            product_name: variant.products?.name || "Unknown",
            variant_sku: variant.sku,
            colour: variant.colour,
            size: variant.size,
            price: variant.price,
            sale_price: variant.sale_price,
            stock_qty: variant.stock_qty,
            image_url: primaryImage?.url || null,
          };
        });

      const subtotal = items.reduce((sum, item) => {
        const effectivePrice =
          item.sale_price !== null ? item.sale_price : item.price;
        return sum + effectivePrice * item.qty;
      }, 0);

      let discountAmount = 0;
      let promoCode: string | null = null;

      if (cart.promotion_id) {
        const { data: promotion } = await supabase
          .from("promotions")
          .select("code, type, value")
          .eq("id", cart.promotion_id)
          .single();

        if (promotion) {
          promoCode = promotion.code;
          if (promotion.type === "PERCENT") {
            discountAmount = (subtotal * promotion.value) / 100;
          } else {
            discountAmount = promotion.value;
          }
        }
      }

      const total = Math.max(0, subtotal - discountAmount);

      return {
        cart_id: cart.id,
        items,
        total_qty: items.reduce((sum, item) => sum + item.qty, 0),
        subtotal,
        promotion_id: cart.promotion_id,
        promotion_code: promoCode,
        discount_amount: discountAmount,
        total,
      };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch cart",
      };
    }
  }

  static async addItem(
    variantId: string,
    qty: number,
    userId?: string,
    sessionKey?: string
  ): Promise<{ cart_id: string; item_id: string } | CartError> {
    try {
      const supabase = await createClient();

      const { data: variant } = await supabase
        .from("product_variants")
        .select("id, status, stock_qty")
        .eq("id", variantId)
        .single();

      if (!variant || variant.status !== "ACTIVE" || variant.stock_qty <= 0) {
        return {
          code: ErrorCode.PRODUCT_NOT_FOUND,
          message: "Variant not available",
        };
      }

      let cartQuery = supabase.from("carts").select("id");

      if (userId) {
        cartQuery = cartQuery.eq("user_id", userId);
      } else if (sessionKey) {
        cartQuery = cartQuery.eq("session_key", sessionKey);
      } else {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "No user_id or session_key provided",
        };
      }

      const { data: cart } = await cartQuery
        .eq("status", "ACTIVE")
        .single();

      let cartId = cart?.id;

      if (!cartId) {
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({
            user_id: userId || null,
            session_key: sessionKey || null,
            status: "ACTIVE",
          })
          .select("id")
          .single();

        if (createError || !newCart) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Failed to create cart",
          };
        }

        cartId = newCart.id;
      }

      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, qty")
        .eq("cart_id", cartId)
        .eq("variant_id", variantId)
        .single();

      let itemId: string;

      if (existingItem) {
        const { data: updated, error: updateError } = await supabase
          .from("cart_items")
          .update({ qty: existingItem.qty + qty })
          .eq("id", existingItem.id)
          .select("id")
          .single();

        if (updateError || !updated) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Failed to update cart item",
          };
        }

        itemId = updated.id;
      } else {
        const { data: newItem, error: insertError } = await supabase
          .from("cart_items")
          .insert({ cart_id: cartId, variant_id: variantId, qty })
          .select("id")
          .single();

        if (insertError || !newItem) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Failed to add cart item",
          };
        }

        itemId = newItem.id;
      }

      return { cart_id: cartId, item_id: itemId };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to add item to cart",
      };
    }
  }

  static async updateItem(
    itemId: string,
    qty: number
  ): Promise<{ success: boolean } | CartError> {
    try {
      if (qty <= 0) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Quantity must be greater than 0",
        };
      }

      const supabase = await createClient();

      const { data: item } = await supabase
        .from("cart_items")
        .select("cart_id, variant_id")
        .eq("id", itemId)
        .single();

      if (!item) {
        return {
          code: ErrorCode.PRODUCT_NOT_FOUND,
          message: "Cart item not found",
        };
      }

      const { data: variant } = await supabase
        .from("product_variants")
        .select("status, stock_qty")
        .eq("id", item.variant_id)
        .single();

      if (!variant || variant.status !== "ACTIVE" || variant.stock_qty <= 0) {
        return {
          code: ErrorCode.PRODUCT_NOT_FOUND,
          message: "Variant no longer available",
        };
      }

      if (qty > variant.stock_qty) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Requested quantity exceeds available stock",
        };
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ qty })
        .eq("id", itemId);

      if (updateError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to update cart item",
        };
      }

      return { success: true };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to update item",
      };
    }
  }

  static async removeItem(itemId: string): Promise<
    { success: boolean } | CartError
  > {
    try {
      const supabase = await createClient();

      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (deleteError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to remove cart item",
        };
      }

      return { success: true };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to remove item",
      };
    }
  }

  static async applyPromotion(
    cartId: string,
    code: string
  ): Promise<{ success: boolean; discount_amount: number } | CartError> {
    try {
      const supabase = await createClient();

      const now = new Date().toISOString();

      const { data: promotion } = await supabase
        .from("promotions")
        .select("id, type, value, min_spend, usage_limit, enabled")
        .eq("code", code)
        .eq("enabled", true)
        .lte("starts_at", now)
        .gte("ends_at", now)
        .single();

      if (!promotion) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Promotion code invalid or expired",
        };
      }

      if (promotion.usage_limit) {
        const { count: usageCount } = await supabase
          .from("promotion_usages")
          .select("*", { count: "exact", head: true })
          .eq("promotion_id", promotion.id);

        if ((usageCount || 0) >= promotion.usage_limit) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Promotion usage limit reached",
          };
        }
      }

      const { error: updateError } = await supabase
        .from("carts")
        .update({ promotion_id: promotion.id })
        .eq("id", cartId);

      if (updateError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to apply promotion",
        };
      }

      return { success: true, discount_amount: 0 };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to apply promotion",
      };
    }
  }

  static async removePromotion(cartId: string): Promise<
    { success: boolean } | CartError
  > {
    try {
      const supabase = await createClient();

      const { error: updateError } = await supabase
        .from("carts")
        .update({ promotion_id: null })
        .eq("id", cartId);

      if (updateError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to remove promotion",
        };
      }

      return { success: true };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to remove promotion",
      };
    }
  }
}
