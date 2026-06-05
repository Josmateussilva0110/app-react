import { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { CheckCircle2, ChevronDown, Tag } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { SectionCard } from "@/components/ui/section-card";
import { CATEGORIES } from "../constants/product-form.constant";
import { type ProductFormControl } from "../../../types/product.form.types";

interface CategorySectionProps {
  control: ProductFormControl;
}

export function CategorySection({ control }: CategorySectionProps) {
  const { colors } = useTheme();

  // Estado de UI — não é dado do formulário, fica local ao componente
  const [open, setOpen] = useState(false);

  return (
    <SectionCard
      title="Categoria*"
      icon={Tag}
      iconColor="#8b5cf6"
      iconBgColor="#8b5cf615"
    >
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => {
          const selected = CATEGORIES.find((c) => c.key === value);

          return (
            <>
              {/* Trigger */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setOpen((prev) => !prev)}
                style={[
                  styles.trigger,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: open ? `${colors.primary}50` : colors.border,
                  },
                ]}
              >
                <View style={styles.triggerLeft}>
                  {selected && (
                    <>
                      <selected.icon size={18} color={colors.primary} />
                      <Text style={[styles.triggerText, { color: colors.text }]}>
                        {selected.label}
                      </Text>
                    </>
                  )}
                </View>

                <ChevronDown
                  size={18}
                  color={colors.textSecondary}
                  style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
                />
              </TouchableOpacity>

              {/* Lista */}
              {open && (
                <View
                  style={[
                    styles.list,
                    { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                  ]}
                >
                  {CATEGORIES.map((item, index) => {
                    const active = value === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        activeOpacity={0.7}
                        onPress={() => {
                          onChange(item.key);
                          setOpen(false);
                        }}
                        style={[
                          styles.item,
                          active && { backgroundColor: `${colors.primary}12` },
                          index < CATEGORIES.length - 1 && {
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                          },
                        ]}
                      >
                        <item.icon
                          size={18}
                          color={active ? colors.primary : colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.itemText,
                            {
                              color: active ? colors.primary : colors.text,
                              fontWeight: active ? "700" : "500",
                            },
                          ]}
                        >
                          {item.label}
                        </Text>

                        {active && (
                          <View style={[styles.check, { backgroundColor: colors.primary }]}>
                            <CheckCircle2 size={14} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          );
        }}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: "600",
  },
  list: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});