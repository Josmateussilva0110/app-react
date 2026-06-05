import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { CreditCard } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { SectionCard } from "@/components/ui/section-card";
import { PAYMENT_TYPES } from "../constants/product-form.constant";
import { type ProductFormControl } from "../../../types/product.form.types";

interface PaymentSectionProps {
  control: ProductFormControl;
}

export function PaymentSection({ control }: PaymentSectionProps) {
  const { colors } = useTheme();

  return (
    <SectionCard
      title="Tipo de Pagamento*"
      icon={CreditCard}
      iconColor="#3b82f6"
      iconBgColor="#3b82f615"
    >
      <Controller
        control={control}
        name="paymentType"
        render={({ field: { onChange, value } }) => (
          <View style={styles.grid}>
            {PAYMENT_TYPES.map((item) => {
              const active = value === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => onChange(item.key)}
                  activeOpacity={0.7}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? `${colors.primary}18` : colors.backgroundElement,
                      borderColor: active ? `${colors.primary}50` : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? colors.primary : colors.textSecondary,
                        fontWeight: active ? "700" : "500",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
});