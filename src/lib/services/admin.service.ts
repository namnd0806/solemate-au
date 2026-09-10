import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export class AdminService {
  static async checkAdminRole(userId: string): Promise<boolean> {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) return false;
    return data.role === "admin";
  }

  static async createAuditLog(
    userId: string,
    action: string,
    resource_type: string,
    resource_id: string,
    changes: Record<string, unknown>
  ) {
    await getSupabase()
      .from("audit_logs")
      .insert({
        user_id: userId,
        action,
        resource_type,
        resource_id,
        changes,
        created_at: new Date().toISOString(),
      });
  }

  // Product Management
  static async createProduct(
    adminId: string,
    productData: Record<string, unknown>
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { data, error } = await getSupabase()
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error("Create product error:", error);
      return { success: false, error: "PRODUCT_CREATE_FAILED" };
    }

    await this.createAuditLog(adminId, "CREATE", "product", data.id, productData);
    return { success: true, product: data };
  }

  static async updateProduct(
    adminId: string,
    productId: string,
    updates: Record<string, unknown>
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { data, error } = await getSupabase()
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Update product error:", error);
      return { success: false, error: "PRODUCT_UPDATE_FAILED" };
    }

    await this.createAuditLog(adminId, "UPDATE", "product", productId, updates);
    return { success: true, product: data };
  }

  static async deleteProduct(adminId: string, productId: string) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { error } = await getSupabase()
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) {
      return { success: false, error: "PRODUCT_DELETE_FAILED" };
    }

    await this.createAuditLog(adminId, "DELETE", "product", productId, {});
    return { success: true };
  }

  // Variant Management
  static async createVariant(
    adminId: string,
    variantData: Record<string, unknown>
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { data, error } = await getSupabase()
      .from("product_variants")
      .insert(variantData)
      .select()
      .single();

    if (error) {
      console.error("Create variant error:", error);
      return { success: false, error: "VARIANT_CREATE_FAILED" };
    }

    await this.createAuditLog(adminId, "CREATE", "product_variant", data.id, variantData);
    return { success: true, variant: data };
  }

  static async updateVariant(
    adminId: string,
    variantId: string,
    updates: Record<string, unknown>
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { data, error } = await getSupabase()
      .from("product_variants")
      .update(updates)
      .eq("id", variantId)
      .select()
      .single();

    if (error) {
      return { success: false, error: "VARIANT_UPDATE_FAILED" };
    }

    await this.createAuditLog(adminId, "UPDATE", "product_variant", variantId, updates);
    return { success: true, variant: data };
  }

  // Stock Adjustment with Inventory Movement
  static async adjustStock(
    adminId: string,
    variantId: string,
    qty_delta: number,
    reason: string
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    // Get current stock
    const { data: variant, error: variantError } = await getSupabase()
      .from("product_variants")
      .select("stock")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      return { success: false, error: "VARIANT_NOT_FOUND" };
    }

    const newStock = variant.stock + qty_delta;

    if (newStock < 0) {
      return { success: false, error: "INSUFFICIENT_STOCK" };
    }

    // Update stock
    const { error: updateError } = await getSupabase()
      .from("product_variants")
      .update({ stock: newStock })
      .eq("id", variantId);

    if (updateError) {
      return { success: false, error: "STOCK_UPDATE_FAILED" };
    }

    // Create inventory movement
    const { error: movementError } = await getSupabase()
      .from("inventory_movements")
      .insert({
        variant_id: variantId,
        qty_delta,
        movement_type: "STOCK_ADJUSTMENT",
        reason,
        reference_id: null,
        created_by: adminId,
      });

    if (movementError) {
      return { success: false, error: "INVENTORY_MOVEMENT_FAILED" };
    }

    await this.createAuditLog(
      adminId,
      "STOCK_ADJUSTMENT",
      "product_variant",
      variantId,
      { qty_delta, reason, new_stock: newStock }
    );

    return { success: true, new_stock: newStock };
  }

  // Order Status Transition
  static async updateOrderStatus(
    adminId: string,
    orderId: string,
    newStatus: string
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["READY_TO_SHIP", "CANCELLED"],
      READY_TO_SHIP: ["SHIPPED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    // Get current status
    const { data: order, error: orderError } = await getSupabase()
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: "ORDER_NOT_FOUND" };
    }

    if (!validTransitions[order.status]?.includes(newStatus)) {
      return {
        success: false,
        error: "INVALID_STATUS_TRANSITION",
        current: order.status,
        requested: newStatus,
      };
    }

    const { error: updateError } = await getSupabase()
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      return { success: false, error: "ORDER_UPDATE_FAILED" };
    }

    await this.createAuditLog(adminId, "UPDATE", "order", orderId, {
      status: newStatus,
    });

    return { success: true };
  }

  // Shipment Management
  static async createShipment(
    adminId: string,
    orderId: string,
    method: string,
    tracking_no: string
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { data: order, error: orderError } = await getSupabase()
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: "ORDER_NOT_FOUND" };
    }

    const { data: shipment, error: createError } = await getSupabase()
      .from("shipments")
      .insert({
        order_id: orderId,
        method,
        tracking_no,
        status: "PENDING",
      })
      .select()
      .single();

    if (createError) {
      return { success: false, error: "SHIPMENT_CREATE_FAILED" };
    }

    await this.createAuditLog(adminId, "CREATE", "shipment", shipment.id, {
      order_id: orderId,
      method,
      tracking_no,
    });

    return { success: true, shipment };
  }

  static async updateShipmentStatus(
    adminId: string,
    shipmentId: string,
    status: string
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const validStatuses = ["PENDING", "SHIPPED", "DELIVERED", "FAILED"];

    if (!validStatuses.includes(status)) {
      return { success: false, error: "INVALID_SHIPMENT_STATUS" };
    }

    const updateData: Record<string, unknown> = { status };

    if (status === "SHIPPED") {
      updateData.shipped_at = new Date().toISOString();
    }

    if (status === "DELIVERED") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await getSupabase()
      .from("shipments")
      .update(updateData)
      .eq("id", shipmentId);

    if (error) {
      return { success: false, error: "SHIPMENT_UPDATE_FAILED" };
    }

    await this.createAuditLog(adminId, "UPDATE", "shipment", shipmentId, {
      status,
    });

    return { success: true };
  }

  // COD Collection
  static async recordCODCollection(
    adminId: string,
    paymentId: string,
    collectedAmount: number
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { data: payment, error: paymentError } = await getSupabase()
      .from("payments")
      .select("amount, status")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return { success: false, error: "PAYMENT_NOT_FOUND" };
    }

    if (payment.status !== "PENDING_COLLECTION") {
      return { success: false, error: "PAYMENT_NOT_COD_PENDING" };
    }

    if (collectedAmount < payment.amount) {
      return {
        success: false,
        error: "INSUFFICIENT_AMOUNT",
        expected: payment.amount,
        provided: collectedAmount,
      };
    }

    const { error: updateError } = await getSupabase()
      .from("payments")
      .update({
        status: "SUCCESS",
        collected_at: new Date().toISOString(),
        collected_amount: collectedAmount,
      })
      .eq("id", paymentId);

    if (updateError) {
      return { success: false, error: "PAYMENT_UPDATE_FAILED" };
    }

    // Update order payment_status
    const { data: order } = await getSupabase()
      .from("orders")
      .select("id")
      .eq("id", (await getSupabase().from("payments").select("order_id").eq("id", paymentId)).data?.[0]?.order_id)
      .single();

    if (order) {
      await getSupabase()
        .from("orders")
        .update({ payment_status: "PAID" })
        .eq("id", order.id);
    }

    await this.createAuditLog(adminId, "COD_COLLECTION", "payment", paymentId, {
      collected_amount: collectedAmount,
    });

    return { success: true };
  }

  // Promotion Management
  static async createPromotion(
    adminId: string,
    promotionData: Record<string, unknown>
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { data: promotion, error } = await getSupabase()
      .from("promotions")
      .insert(promotionData)
      .select()
      .single();

    if (error) {
      return { success: false, error: "PROMOTION_CREATE_FAILED" };
    }

    await this.createAuditLog(adminId, "CREATE", "promotion", promotion.id, promotionData);
    return { success: true, promotion };
  }

  static async updatePromotion(
    adminId: string,
    promotionId: string,
    updates: Record<string, unknown>
  ) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { data: promotion, error } = await getSupabase()
      .from("promotions")
      .update(updates)
      .eq("id", promotionId)
      .select()
      .single();

    if (error) {
      return { success: false, error: "PROMOTION_UPDATE_FAILED" };
    }

    await this.createAuditLog(adminId, "UPDATE", "promotion", promotionId, updates);
    return { success: true, promotion };
  }

  static async deletePromotion(adminId: string, promotionId: string) {
    if (!(await this.checkAdminRole(adminId))) {
      return { success: false, error: "ADMIN_ROLE_REQUIRED" };
    }

    const { error } = await getSupabase()
      .from("promotions")
      .update({ enabled: false })
      .eq("id", promotionId);

    if (error) {
      return { success: false, error: "PROMOTION_DELETE_FAILED" };
    }

    await this.createAuditLog(adminId, "DELETE", "promotion", promotionId, {});
    return { success: true };
  }
}
