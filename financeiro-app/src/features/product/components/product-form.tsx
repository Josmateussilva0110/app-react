import { ScrollView, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/schemas/product.schema";

import { type ProductFormData, type ProductFormInput } from "../../../types/product.form.types";
import { InfoSection } from "./info-section";
import { PrioritySection } from "./priority-section";
import { PaymentSection } from "./payment-section";
import { CategorySection } from "./category-section";
import { DateSection } from "./date-section";
import { OptionsSection } from "./options-section";
import { SaveButton } from "./saveButton";

export function ProductForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:        "",
      price:       "",
      priority:    "media",
      paymentType: "nao_comprado",
      category:    "compras",
      date:        "",
      finished:    false,
      monthList:   false,
    },
  });

  function onSubmit(data: ProductFormData) {
    // data.price já é number aqui (após o transform do Zod)
    console.log("Form submitted:", data);
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <InfoSection    control={control} errors={errors} />
      <PrioritySection control={control} />
      <PaymentSection  control={control} />
      <CategorySection control={control} />
      <DateSection    control={control} errors={errors} />
      <OptionsSection  control={control} />
      <SaveButton onPress={handleSubmit(onSubmit,)} />
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