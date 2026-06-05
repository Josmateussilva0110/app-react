import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Controller, type Control } from "react-hook-form";
import { Flame } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { SectionCard } from "@/components/ui/section-card";
import { PRIORITIES } from "../constants/product-form.constant";
import { type ProductFormControl } from "../../../types/product.form.types";

interface PrioritySectionProps {
  control: ProductFormControl;
}

export function PrioritySection({ control }: PrioritySectionProps) {
  const { colors } = useTheme();

  return (
    <SectionCard
      title="Prioridade*"
      icon={Flame}
      iconColor="#f59e0b"
      iconBgColor="#f59e0b15"
    >
      <Controller
        control={control}
        name="priority"
        render={({ field: { onChange, value } }) => (
          <View style={styles.row}>
            {PRIORITIES.map((item) => {
              const active = value === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => onChange(item.key)}
                  activeOpacity={0.7}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? `${item.color}18` : colors.backgroundElement,
                      borderColor: active ? `${item.color}50` : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? item.color : colors.textSecondary,
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
  row: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
});
