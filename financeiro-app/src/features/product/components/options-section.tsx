import { Controller } from "react-hook-form";
import { CheckCircle2, ListChecks } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { SectionCard } from "@/components/ui/section-card";
import { ToggleRow } from "@/components/ui/toggle.row";
import { type ProductFormControl } from "../../../types/product.form.types";

interface OptionsSectionProps {
  control: ProductFormControl;
}

export function OptionsSection({ control }: OptionsSectionProps) {
  const { colors } = useTheme();

  return (
    <SectionCard
      title="Opções*"
      icon={ListChecks}
      iconColor={colors.primary}
      iconBgColor={`${colors.primary}15`}
    >
      <Controller
        control={control}
        name="finished"
        render={({ field: { onChange, value } }) => (
          <ToggleRow
            icon={CheckCircle2}
            label="Finalizado"
            hint="Marcar como comprado"
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="monthList"
        render={({ field: { onChange, value } }) => (
          <ToggleRow
            icon={ListChecks}
            label="Lista do Mês"
            hint="Incluir na lista mensal"
            value={value}
            onChange={onChange}
          />
        )}
      />
    </SectionCard>
  );
}
