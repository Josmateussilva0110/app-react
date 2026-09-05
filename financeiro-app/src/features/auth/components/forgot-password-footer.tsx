import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function ForgotPasswordFooter() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <ArrowLeft size={16} color={colors.primary} />
        <Text style={styles.backText}>Voltar ao login</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Não tem conta?{" "}
        <Link href="/register" style={styles.link}>
          Cadastre-se
        </Link>
      </Text>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    backText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
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
