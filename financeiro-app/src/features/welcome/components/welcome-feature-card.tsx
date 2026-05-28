import { View, Text, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type Props = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export function WelcomeFeatureCard({ icon: Icon, title, desc }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Icon size={20} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{desc}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      padding: 16,
      borderRadius: 20,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    iconWrapper: {
      width: 42,
      height: 42,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(34,197,94,0.08)",
    },
    content: {
      flex: 1,
    },
    title: {
      fontWeight: "600",
      fontSize: 15,
      color: colors.text,
    },
    description: {
      fontSize: 13,
      marginTop: 2,
      color: colors.textSecondary,
    },
  });
