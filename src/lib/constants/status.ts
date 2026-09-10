/**
 * Shared status enums
 * Used across UI, API, and database layers to ensure consistency
 */

export const UserRole = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
  LOCKED: "LOCKED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ProductStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const CartStatus = {
  ACTIVE: "ACTIVE",
  CONVERTED: "CONVERTED",
  ABANDONED: "ABANDONED",
} as const;

export type CartStatus = (typeof CartStatus)[keyof typeof CartStatus];

export const OrderStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  INITIATED: "INITIATED",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  DECLINED: "DECLINED",
  PENDING_COLLECTION: "PENDING_COLLECTION",
  PAID: "PAID",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CARD: "CARD",
  PAYPAL: "PAYPAL",
  AFTERPAY: "AFTERPAY",
  COD: "COD",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ShipmentStatus = {
  PENDING: "PENDING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
} as const;

export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const ShippingMethod = {
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
} as const;

export type ShippingMethod = (typeof ShippingMethod)[keyof typeof ShippingMethod];

export const PromotionType = {
  PERCENT: "PERCENT",
  FIXED: "FIXED",
} as const;

export type PromotionType = (typeof PromotionType)[keyof typeof PromotionType];

export const InventoryMovementType = {
  ORDER: "ORDER",
  ORDER_CANCEL: "ORDER_CANCEL",
  MANUAL_ADJUSTMENT: "MANUAL_ADJUSTMENT",
} as const;

export type InventoryMovementType = (typeof InventoryMovementType)[keyof typeof InventoryMovementType];
