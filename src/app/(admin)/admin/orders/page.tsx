import { Card, CardContent } from "@/components/ui/card";

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Orders</h1>
      <Card>
        <CardContent className="p-8">
          <p className="text-muted-foreground">Order list will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
}
