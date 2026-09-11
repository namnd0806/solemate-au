"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  X,
  RotateCcw,
} from "lucide-react";

interface OrderDetailData {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  shipment_status: string;
  tracking_number?: string;
  total: number;
  payment_method: string;
  shipping_address: {
    full_name: string;
    street_address: string;
    suburb: string;
    postcode: string;
    state: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    sku: string;
    colour?: string;
    size?: string;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  discount: number;
  shipping_fee: number;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [canceling, setCanceling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError("Unable to load order details");
        }
      } catch (err) {
        setError("Error fetching order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!orderId || !window.confirm("Are you sure you want to cancel this order?"))
      return;

    setCanceling(true);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
        alert("Order cancelled successfully");
      } else {
        alert("Failed to cancel order");
      }
    } catch (err) {
      alert("Error canceling order");
      console.error(err);
    } finally {
      setCanceling(false);
    }
  };

  const handleReorder = async () => {
    if (!orderId) return;

    setReordering(true);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/reorder`, {
        method: "POST",
      });
      if (res.ok) {
        router.push("/cart");
      } else {
        alert("Failed to reorder");
      }
    } catch (err) {
      alert("Error reordering");
      console.error(err);
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error || "Order not found"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-indigo-100 text-indigo-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShipmentStatusColor = (status: string) => {
    switch (status) {
      case "NOT_SHIPPED":
        return "bg-gray-100 text-gray-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const canReorder = ["DELIVERED", "CANCELLED"].includes(order.status);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Order Details
              </h1>
              <p className="text-gray-600">
                Order #{" "}
                <span className="font-mono font-bold text-accent">
                  {order.order_number}
                </span>
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.created_at).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm text-gray-600">Payment</p>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm text-gray-600">Shipment</p>
                  <Badge className={getShipmentStatusColor(order.shipment_status)}>
                    {order.shipment_status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Method</p>
              <p className="font-semibold text-gray-900">
                {order.payment_method}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tracking */}
        {order.tracking_number && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700 mb-1">Tracking Number</p>
              <p className="font-mono font-bold text-blue-900">
                {order.tracking_number}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900 mb-2">
                  {order.shipping_address.full_name}
                </p>
                <p className="text-gray-600">{order.shipping_address.street_address}</p>
                <p className="text-gray-600">
                  {order.shipping_address.suburb} {order.shipping_address.state}{" "}
                  {order.shipping_address.postcode}
                </p>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`pb-4 ${
                        idx !== order.items.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-600 font-mono">
                            SKU: {item.sku}
                          </p>
                          {(item.colour || item.size) && (
                            <p className="text-sm text-gray-600">
                              {item.colour && `Color: ${item.colour}`}
                              {item.colour && item.size && " • "}
                              {item.size && `Size: ${item.size}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.unit_price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × ${item.unit_price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ${order.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">
                        -${order.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      ${order.shipping_fee.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-accent">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {canCancel && (
                <Button
                  onClick={handleCancelOrder}
                  disabled={canceling}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  {canceling ? "Canceling..." : "Cancel Order"}
                </Button>
              )}
              {canReorder && (
                <Button
                  onClick={handleReorder}
                  disabled={reordering}
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {reordering ? "Reordering..." : "Buy Again"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
