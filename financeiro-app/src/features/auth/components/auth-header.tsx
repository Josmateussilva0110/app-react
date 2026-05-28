import { View, Text, StyleSheet } from "react-native";
import { Wallet } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type Props = {
  subtitle: string;
};

export function AuthHeader({ subtitle }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.iconWrap}>
        <Wallet size={30} color="#fff" />
      </View>

      <Text style={styles.title}>Finanças</Text>

      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      alignItems: "center",
      marginBottom: 32,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginTop: 16,
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 14,
      textAlign: "center",
      color: colors.textSecondary,
    },
  });
