import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

interface ToggleRowProps {
  icon: LucideIcon;
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ icon: Icon, label, hint, value, onChange }: ToggleRowProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
      style={[
        styles.row,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: value ? `${colors.primary}50` : colors.border,
        },
      ]}
    >
      <View style={styles.left}>
        <Icon size={20} color={value ? colors.primary : colors.textSecondary} />
        <View>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: value ? colors.primary : colors.border }]}>
        <View style={[styles.thumb, value && styles.thumbActive]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    marginTop: 1,
  },
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: "center",
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  thumbActive: {
    alignSelf: "flex-end",
  },
});