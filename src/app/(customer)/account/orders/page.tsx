"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  id: string;
  product_name: string;
  sku: string;
  colour: string;
  size: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

interface Shipment {
  id: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface Order {
  id: string;
  order_no: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  shipping_address_json: {
    full_name: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  items?: OrderItem[];
  shipment?: Shipment;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  READY_TO_SHIP: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  PENDING_COLLECTION: "bg-orange-100 text-orange-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/me/orders?page=1&limit=20");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        setError("Failed to fetch orders");
      }
    } catch {
      setError("Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const fetchOrderDetail = async (orderId: string) => {
    try {
      const res = await fetch(`/api/v1/me/orders/${orderId}`);
      if (res.ok) {
        setSelectedOrder(await res.json());
      }
    } catch {
      setError("Failed to fetch order details");
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(`/api/v1/me/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          await fetchOrderDetail(orderId);
        }
      } else {
        setError("Failed to cancel order");
      }
    } catch {
      setError("Error canceling order");
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/v1/me/orders/${orderId}/reorder`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/checkout?cart_id=${data.cart_id}`);
      } else {
        setError("Failed to reorder");
      }
    } catch {
      setError("Error reordering");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

        {error && (
          <div className="mb-4 rounded bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="mb-4 text-muted-foreground">
                You haven&apos;t placed any orders yet
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => fetchOrderDetail(order.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold">Order {order.order_no}</h3>
                        <Badge className={statusColors[order.status]}>
                          {order.status}
                        </Badge>
                        <Badge
                          className={paymentStatusColors[order.payment_status]}
                        >
                          {order.payment_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_address_json.suburb},{" "}
                        {order.shipping_address_json.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => setSelectedOrder(null)}
        className="mb-6"
      >
        ← Back to Orders
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Order {selectedOrder.order_no}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={statusColors[selectedOrder.status]}>
                    {selectedOrder.status}
                  </Badge>
                  <Badge
                    className={
                      paymentStatusColors[selectedOrder.payment_status]
                    }
                  >
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between pb-4 border-b">
                    <div>
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.colour} / {item.size} × {item.qty}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${item.subtotal.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${item.unit_price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipment */}
          {selectedOrder.shipment && (
            <Card>
              <CardHeader>
                <CardTitle>Shipment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedOrder.shipment.status]}>
                    {selectedOrder.shipment.status}
                  </Badge>
                </div>
                {selectedOrder.shipment.carrier && (
                  <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="font-semibold">
                      {selectedOrder.shipment.carrier}
                    </p>
                  </div>
                )}
                {selectedOrder.shipment.tracking_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tracking Number
                    </p>
                    <p className="font-semibold">
                      {selectedOrder.shipment.tracking_number}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            {["PENDING", "PROCESSING", "READY_TO_SHIP"].includes(
              selectedOrder.status
            ) && (
              <Button
                variant="destructive"
                onClick={() => handleCancel(selectedOrder.id)}
              >
                Cancel Order
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleReorder(selectedOrder.id)}
            >
              Reorder
            </Button>
          </div>
        </div>

        {/* Summary */}
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−${selectedOrder.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${selectedOrder.shipping_fee.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${selectedOrder.total.toFixed(2)}</span>
            </div>

            {/* Shipping Address */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2">Shipping Address</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{selectedOrder.shipping_address_json.full_name}</p>
                <p>{selectedOrder.shipping_address_json.street}</p>
                <p>
                  {selectedOrder.shipping_address_json.suburb}{" "}
                  {selectedOrder.shipping_address_json.state}{" "}
                  {selectedOrder.shipping_address_json.postcode}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
