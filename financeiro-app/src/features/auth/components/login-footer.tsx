import { Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function LoginFooter() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Text style={styles.footer}>
      Não tem conta?{" "}
      <Link href="/register" style={styles.link}>
        Cadastre-se
      </Link>
    </Text>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    footer: {
      textAlign: "center",
      fontSize: 14,
      color: colors.textSecondary,
    },
    link: {
      fontWeight: "600",
      color: colors.primary,
    },
  });