import { ScrollView, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { productFormSchema, type ProductFormData, type ProductFormInput } from "@/schemas/product.schema"; // ← tudo do mesmo lugar
import { InfoSection } from "./info-section";
import { PrioritySection } from "./priority-section";
import { PaymentSection } from "./payment-section";
import { CategorySection } from "./category-section";
import { DateSection } from "./date-section";
import { OptionsSection } from "./options-section";
import { SaveButton } from "./saveButton";
import { requestData } from "../../../services/request";
import { useToast } from "@/context/toast.context";


export function ProductForm() {
  const router = useRouter();
  const { show } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productFormSchema), 
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

  async function onSubmit(data: ProductFormData) {
    const response = await requestData<{ id: string }>({endpoint: "/product", method: "POST", data, withAuth: true})
    if(!response.success) {
      show("error", response.message);
      return;
    } 
    show("success", response.message);
    router.replace("/(protected)/month-list");
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <InfoSection     control={control} errors={errors} />
      <PrioritySection control={control} />
      <PaymentSection  control={control} />
      <CategorySection control={control} />
      <DateSection     control={control} errors={errors} />
      <OptionsSection  control={control} />
      <SaveButton onPress={handleSubmit(onSubmit)} />
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
