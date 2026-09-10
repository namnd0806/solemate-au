import { Suspense } from "react";
import ProductsContent from "./content";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
