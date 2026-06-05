import { Controller, type FieldErrors } from "react-hook-form";
import { DollarSign, Package } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { FormField } from "@/components/ui/form-field";
import { SectionCard } from "@/components/ui/section-card";
import { ProductFormInput, type ProductFormControl } from "../../../types/product.form.types";

interface InfoSectionProps {
  control: ProductFormControl;
  errors: FieldErrors<ProductFormInput>;
}

export function InfoSection({ control, errors }: InfoSectionProps) {
  const { colors } = useTheme();

  return (
    <SectionCard
      title="Informações"
      icon={Package}
      iconColor={colors.primary}
      iconBgColor={`${colors.primary}15`}
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Nome do Produto*"
            icon={Package}
            error={errors.name?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Ex: Tênis de corrida"
          />
        )}
      />

      <Controller
        control={control}
        name="price"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Preço Estimado*"
            icon={DollarSign}
            error={errors.price?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="numeric"
            placeholder="0,00"
          />
        )}
      />
    </SectionCard>
  );
}
