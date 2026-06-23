import { AppShell } from "@/components/appShell";
import { ProductForm } from "../../../features/product/components/product-form";

export default function CreateProductScreen() {
  return (
    <AppShell
      title="Novo Produto"
      subtitle="Adicione um item à sua lista"
    >
      <ProductForm />
    </AppShell>
  );
}
