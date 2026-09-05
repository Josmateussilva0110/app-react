import { Text, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function LoginFooter() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.helpText}>
        Esqueceu a senha?{" "}
        <Link href="/forgot-password" style={styles.link}>
          Solicitar ajuda
        </Link>
      </Text>

      <Text style={styles.footer}>
        Não tem conta?{" "}
        <Link href="/register" style={styles.link}>
          Cadastre-se
        </Link>
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    helpText: {
      textAlign: "center",
      fontSize: 14,
      color: colors.textSecondary,
    },
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