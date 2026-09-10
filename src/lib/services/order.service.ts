import { createClient } from "@supabase/supabase-js";

export interface PlaceOrderPayload {
  checkout_id: string;
  payment_method: "CARD" | "PAYPAL" | "AFTERPAY" | "COD";
  idempotency_key: string;
  card_payload?: {
    card_number: string;
    card_holder: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
  };
}

export interface PlaceOrderResult {
  success: boolean;
  order_id?: string;
  order_no?: string;
  total?: number;
  payment_id?: string;
  error?: string;
  error_code?: string;
}

export class OrderService {
  static async placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResult> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // 1. Check idempotency - if order with same key exists, return it
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, order_no, total, payments(id)")
        .eq("idempotency_key", payload.idempotency_key)
        .single();

      if (existingOrder) {
        return {
          success: true,
          order_id: existingOrder.id,
          order_no: existingOrder.order_no,
          total: existingOrder.total,
          payment_id: existingOrder.payments?.[0]?.id,
        };
      }

      // 2. Fetch and validate checkout session
      const { data: checkout, error: checkoutError } = await supabase
        .from("checkout_sessions")
        .select(
          `
          id,
          expires_at,
          user_id,
          shipping_method,
          shipping_fee,
          promotion_id,
          shipping_address_json,
          carts(
            id,
            user_id,
            cart_items(
              id,
              qty,
              product_variants(
                id,
                stock,
                sale_price,
                price,
                sku,
                colour,
                size,
                products(id, name, brand_name)
              )
            ),
            promotions(id, type, value, min_spend, max_uses, usage_count, starts_at, ends_at)
          )
        `
        )
        .eq("id", payload.checkout_id)
        .single();

      if (checkoutError || !checkout) {
        return {
          success: false,
          error: "Checkout session not found",
          error_code: "CHECKOUT_NOT_FOUND",
        };
      }

      // Check expiry
      if (new Date(checkout.expires_at) < new Date()) {
        return {
          success: false,
          error: "Checkout session expired",
          error_code: "CHECKOUT_EXPIRED",
        };
      }

      // 3. Calculate totals server-side
      let subtotal = 0;
      const cartData = checkout.carts as unknown as {
        cart_items: Array<{
          product_variants: { sale_price: number | null; price: number; stock: number; sku: string; id: string; colour: string; size: string; products: { name: string; brand_name: string } };
          qty: number;
        }>;
        promotions: { id: string; type: string; value: number; min_spend: number; max_uses: number | null; usage_count: number; starts_at: string; ends_at: string };
      };
      const items = cartData?.cart_items || [];

      if (items.length === 0) {
        return {
          success: false,
          error: "Cart is empty",
          error_code: "CART_EMPTY",
        };
      }

      // Validate stock and calculate subtotal
      for (const item of items) {
        const variant = item.product_variants;
        const effectivePrice = variant.sale_price ?? variant.price;

        if (!variant || variant.stock < item.qty) {
          return {
            success: false,
            error: `Insufficient stock for ${variant.sku}`,
            error_code: "INSUFFICIENT_STOCK",
          };
        }

        subtotal += effectivePrice * item.qty;
      }

      // 4. Validate and calculate promotion discount
      let discount = 0;
      let promotionId: string | null = null;

      if (checkout.promotion_id) {
        const promo = cartData?.promotions;
        if (promo) {
          const now = new Date();
          if (new Date(promo.starts_at) > now) {
            return {
              success: false,
              error: "Promotion not started",
              error_code: "PROMO_NOT_STARTED",
            };
          }

          if (new Date(promo.ends_at) < now) {
            return {
              success: false,
              error: "Promotion expired",
              error_code: "PROMO_EXPIRED",
            };
          }

          if (promo.max_uses && promo.usage_count >= promo.max_uses) {
            return {
              success: false,
              error: "Promotion usage limit exceeded",
              error_code: "PROMO_USAGE_LIMIT_EXCEEDED",
            };
          }

          if (subtotal < promo.min_spend) {
            return {
              success: false,
              error: "Minimum spend requirement not met",
              error_code: "PROMO_MIN_SPEND_NOT_MET",
            };
          }

          if (promo.type === "PERCENT") {
            discount = (subtotal * promo.value) / 100;
          } else {
            discount = promo.value;
          }
          discount = Math.min(discount, subtotal);
          promotionId = promo.id;
        }
      }

      const shippingFee = checkout.shipping_fee ?? 0;
      const total = subtotal - discount + shippingFee;

      // 5. Generate order number
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 5).toUpperCase();
      const order_no = `ORD-${timestamp.toString().slice(-8)}-${random}`;

      // 6. Start transaction - insert order, order_items, inventory movements, payment
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_no,
          user_id: checkout.user_id,
          status: "PENDING",
          payment_status: "INITIATED",
          subtotal,
          discount,
          shipping_fee: shippingFee,
          total,
          shipping_address_json: checkout.shipping_address_json,
          idempotency_key: payload.idempotency_key,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        console.error("Order insert error:", orderError);
        return {
          success: false,
          error: "Failed to create order",
          error_code: "ORDER_CREATE_FAILED",
        };
      }

      const orderId = order.id;

      // 7. Create order_items (snapshots)
      interface CartItemWithVariant {
        qty: number;
        product_variants: {
          id: string;
          sku: string;
          colour: string;
          size: string;
          price: number;
          sale_price: number | null;
          products: { name: string; brand_name: string };
        };
      }

      const orderItems = (items as unknown as Array<{ product_variants: { id: string; sku: string; colour: string; size: string; sale_price: number | null; price: number; products: { name: string; brand_name: string } }; qty: number }>).map((item) => {
        const variant = item.product_variants;
        const product = variant.products;
        const effectivePrice = variant.sale_price ?? variant.price;
        return {
          order_id: orderId,
          variant_id: variant.id,
          sku_snapshot: variant.sku,
          name_snapshot: product.name,
          brand_snapshot: product.brand_name,
          colour_snapshot: variant.colour,
          size_snapshot: variant.size,
          unit_price: effectivePrice,
          qty: item.qty,
          line_total: effectivePrice * item.qty,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
        // Rollback - delete order
        await supabase.from("orders").delete().eq("id", orderId);
        return {
          success: false,
          error: "Failed to create order items",
          error_code: "ORDER_ITEMS_FAILED",
        };
      }

      // 8. Deduct stock and record inventory movements
      for (const item of items) {
        const variant = item.product_variants;
        const newStock = variant.stock - item.qty;

        // Update variant stock
        const { error: stockError } = await supabase
          .from("product_variants")
          .update({ stock: newStock })
          .eq("id", variant.id);

        if (stockError) {
          console.error("Stock update error:", stockError);
          await supabase.from("orders").delete().eq("id", orderId);
          await supabase.from("order_items").delete().eq("order_id", orderId);
          return {
            success: false,
            error: "Failed to update stock",
            error_code: "STOCK_UPDATE_FAILED",
          };
        }

        // Record inventory movement
        const { error: movementError } = await supabase
          .from("inventory_movements")
          .insert({
            variant_id: variant.id,
            type: "ORDER",
            qty_delta: -item.qty,
            qty_before: variant.stock,
            qty_after: newStock,
            ref_type: "ORDER",
            ref_id: orderId,
            reason: `Order ${order_no}`,
          });

        if (movementError) {
          console.error("Inventory movement error:", movementError);
          // Rollback
          await supabase
            .from("product_variants")
            .update({ stock: variant.stock })
            .eq("id", variant.id);
          await supabase.from("orders").delete().eq("id", orderId);
          await supabase.from("order_items").delete().eq("order_id", orderId);
          return {
            success: false,
            error: "Failed to record inventory movement",
            error_code: "INVENTORY_MOVEMENT_FAILED",
          };
        }
      }

      // 9. Record promotion usage
      if (promotionId) {
        const { error: usageError } = await supabase
          .from("promotion_usages")
          .insert({
            promotion_id: promotionId,
            user_id: checkout.user_id,
            order_id: orderId,
            amount_discounted: discount,
          });

        if (usageError) {
          console.error("Promotion usage error:", usageError);
        }
      }

      // 10. Create shipment
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .insert({
          order_id: orderId,
          method: checkout.shipping_method || "STANDARD",
          status: "PENDING",
        })
        .select("id")
        .single();

      if (shipmentError) {
        console.error("Shipment error:", shipmentError);
      }

      // 11. Create payment record and simulate payment
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: orderId,
          checkout_session_id: checkout.id,
          method: payload.payment_method,
          status: "INITIATED",
          amount: total,
        })
        .select("id")
        .single();

      if (paymentError || !payment) {
        console.error("Payment record error:", paymentError);
        return {
          success: false,
          error: "Failed to create payment record",
          error_code: "PAYMENT_RECORD_FAILED",
        };
      }

      return {
        success: true,
        order_id: orderId,
        order_no,
        total,
        payment_id: payment.id,
      };
    } catch (error) {
      console.error("Place order error:", error);
      return {
        success: false,
        error: "Internal server error",
        error_code: "ORDER_EXCEPTION",
      };
    }
  }

  static async cancelOrder(orderId: string, userId: string): Promise<{ success: boolean; error?: string; error_code?: string }> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Fetch order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, status, order_items(qty, product_variants(id, stock))")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return { success: false, error: "Order not found", error_code: "ORDER_NOT_FOUND" };
      }

      // Check ownership
      const { data: orderWithUser } = await supabase
        .from("orders")
        .select("user_id")
        .eq("id", orderId)
        .single();

      if (orderWithUser?.user_id !== userId) {
        return { success: false, error: "Unauthorized", error_code: "UNAUTHORIZED" };
      }

      // Check if cancellable (only PENDING or PROCESSING)
      if (!["PENDING", "PROCESSING"].includes(order.status)) {
        return {
          success: false,
          error: `Cannot cancel order with status ${order.status}`,
          error_code: "CANCEL_NOT_ALLOWED",
        };
      }

      // Restore stock
      interface OrderItem {
        qty: number;
        product_variants: { id: string; stock: number };
      }

      const itemsToRestore = (order.order_items as unknown as OrderItem[]) || [];
      for (const item of itemsToRestore) {
        const variant = item.product_variants;
        const newStock = variant.stock + item.qty;

        await supabase
          .from("product_variants")
          .update({ stock: newStock })
          .eq("id", variant.id);

        await supabase.from("inventory_movements").insert({
          variant_id: variant.id,
          type: "ORDER_CANCEL",
          qty_delta: item.qty,
          qty_before: variant.stock,
          qty_after: newStock,
          ref_type: "ORDER",
          ref_id: orderId,
          reason: `Cancel order ${order.id}`,
        });
      }

      // Update order status
      await supabase
        .from("orders")
        .update({ status: "CANCELLED" })
        .eq("id", orderId);

      return { success: true };
    } catch (error) {
      console.error("Cancel order error:", error);
      return { success: false, error: "Internal server error", error_code: "CANCEL_EXCEPTION" };
    }
  }

  static async reorder(orderId: string, userId: string): Promise<{ success: boolean; cart_id?: string; error?: string; error_code?: string }> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Fetch original order items
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("user_id, order_items(variant_id, qty)")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return { success: false, error: "Order not found", error_code: "ORDER_NOT_FOUND" };
      }

      if (order.user_id !== userId) {
        return { success: false, error: "Unauthorized", error_code: "UNAUTHORIZED" };
      }

      // Validate all variants exist and have stock
      interface OrderItemForReorder {
        variant_id: string;
        qty: number;
      }

      const itemsForReorder = (order.order_items as OrderItemForReorder[]) || [];
      for (const item of itemsForReorder) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("id, stock")
          .eq("id", item.variant_id)
          .single();

        if (!variant || variant.stock < item.qty) {
          return {
            success: false,
            error: `Insufficient stock or variant not found`,
            error_code: "REORDER_STOCK_UNAVAILABLE",
          };
        }
      }

      // Get or create cart for user
      const { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      let cartId: string;

      if (cartError) {
        // Create new cart
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ user_id: userId, status: "ACTIVE" })
          .select("id")
          .single();

        cartId = newCart?.id || "";
      } else {
        cartId = cartData?.id || "";
      }

      // Add items to cart
      const cartItems = itemsForReorder.map((item) => ({
        cart_id: cartId,
        variant_id: item.variant_id,
        qty: item.qty,
      }));

      await supabase.from("cart_items").insert(cartItems);

      return { success: true, cart_id: cartId };
    } catch {
      return { success: false, error: "Internal server error", error_code: "REORDER_EXCEPTION" };
    }
  }
}
