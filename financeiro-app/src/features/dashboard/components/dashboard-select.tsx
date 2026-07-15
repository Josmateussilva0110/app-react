import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { Spacing } from "@/constants/theme";

export type SelectOption = { value: string; label: string };

type DashboardSelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  style?: object;
};

export function DashboardSelect({
  label,
  value,
  options,
  onChange,
  style,
}: DashboardSelectProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <View style={style}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          { backgroundColor: colors.backgroundElement, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.triggerText, { color: colors.text }]} numberOfLines={1}>
          {selected?.label ?? "Selecionar"}
        </Text>
        <ChevronDown size={16} color={colors.textSecondary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{label}</Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      active && { backgroundColor: colors.backgroundSelected },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: active ? colors.primary : colors.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {active && <Check size={16} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "500",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  sheet: {
    width: "100%",
    maxWidth: 340,
    maxHeight: "70%",
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: Spacing.two,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
