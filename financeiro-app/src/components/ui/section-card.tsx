import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SectionCard({
  title,
  icon: Icon,
  iconColor,
  iconBgColor,
  children,
  style,
}: SectionCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorderDefault,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: iconBgColor }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});
