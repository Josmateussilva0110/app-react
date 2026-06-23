import { ScrollView, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  productFormSchema,
  type ProductFormData,
  type ProductFormInput,
} from "@/schemas/product.schema";
import { InfoSection } from "./info-section";
import { PrioritySection } from "./priority-section";
import { PaymentSection } from "./payment-section";
import { CategorySection } from "./category-section";
import { DateSection } from "./date-section";
import { OptionsSection } from "./options-section";
import { SaveButton } from "./saveButton";
import { useToast } from "@/context/toast.context";
import { useUpdateProduct } from "../../../hooks/use-update-product";
import { useCreateProduct } from "../../../hooks/use-create-product";

const DEFAULT_VALUES: ProductFormInput = {
  name: "",
  price: "",
  priority: "media",
  paymentType: "nao_comprado",
  category: "compras",
  date: "",
  finished: false,
  monthList: false,
};

interface ProductFormProps {
  mode?: "create" | "edit";
  productId?: string;
  initialValues?: ProductFormInput;
  onSuccess?: () => void;
}

export function ProductForm({
  mode = "create",
  productId,
  initialValues,
  onSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const isEdit = mode === "edit";

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId ?? "");

  const { control, handleSubmit, reset, formState: { errors } } =
    useForm<ProductFormInput, unknown, ProductFormData>({
      resolver: zodResolver(productFormSchema),
      defaultValues: initialValues ?? DEFAULT_VALUES,
    });

  async function onSubmit(data: ProductFormData) {
    try {
      const result = isEdit
        ? await updateMutation.mutateAsync(data)
        : await createMutation.mutateAsync(data);

      if (!result.success) {
        show("error", result.message);
        return;
      }

      show("success", result.message);
      onSuccess?.();

      if (isEdit) {
        router.back();
        return;
      }

      reset(DEFAULT_VALUES);
      router.replace("/(protected)/(tabs)/month-list");

    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      show("error", message);
    }
  }

  const isPending = isEdit
    ? updateMutation.isPending
    : createMutation.isPending;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <InfoSection control={control} errors={errors} />
      <PrioritySection control={control} />
      <PaymentSection control={control} />
      <CategorySection control={control} />
      <DateSection control={control} errors={errors} />
      <OptionsSection control={control} />
      <SaveButton
        onPress={handleSubmit(onSubmit)}
        label={isEdit ? "Salvar Alterações" : "Salvar Produto"}
        loading={isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
});
