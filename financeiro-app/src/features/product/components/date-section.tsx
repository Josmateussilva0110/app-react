import { Controller, type FieldErrors } from "react-hook-form";
import { CalendarDays } from "lucide-react-native";
import { DateField } from "@/components/ui/date-field";
import { SectionCard } from "@/components/ui/section-card";
import { ProductFormInput, type ProductFormControl } from "../../../types/product.form.types";

interface DateSectionProps {
  control: ProductFormControl;
  errors: FieldErrors<ProductFormInput>;
}

export function DateSection({ control, errors }: DateSectionProps) {
  return (
    <SectionCard
      title="Data*"
      icon={CalendarDays}
      iconColor="#06b6d4"
      iconBgColor="#06b6d415"
    >
      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, onBlur, value } }) => (
          <DateField
            label="Data de Compra"
            error={errors.date?.message}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
      />
    </SectionCard>
  );
}
