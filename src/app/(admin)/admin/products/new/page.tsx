import ProductFormPage from "../[id]/page";

export default function NewProductPage() {
  return <ProductFormPage params={Promise.resolve({})} />;
}
