import { useState, useEffect } from "react";
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
import { requestData } from "../../../services/request";
import { useToast } from "@/context/toast.context";

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
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues ?? DEFAULT_VALUES,
  });

  async function onSubmit(data: ProductFormData) {
    setSubmitting(true);

    const response = isEdit
      ? await requestData<{ id: string }>({
          endpoint: `/products/${productId}`,
          method: "PUT",
          data,
          withAuth: true,
        })
      : await requestData<{ id: string }>({
          endpoint: "/products",
          method: "POST",
          data,
          withAuth: true,
        });

    setSubmitting(false);

    if (!response.success) {
      show("error", response.message);
      return;
    }

    if (isEdit) {
      show("success", response.message);
      onSuccess?.();
      router.back();
      return;
    }

    reset(DEFAULT_VALUES);
    show("success", response.message);
    router.replace("/(protected)/month-list");
  }

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
        loading={submitting}
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
