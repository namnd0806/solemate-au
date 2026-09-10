import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <Card>
        <CardContent className="p-8">
          <p className="text-muted-foreground">Product list will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
}
