import { View, Text, StyleSheet } from "react-native";
import { Wallet } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function WelcomeHeader() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Wallet size={40} color="#fff" />
      </View>

      <Text style={styles.title}>
        Bem-vindo ao{" "}
        <Text style={styles.titleHighlight}>Finanças</Text>
      </Text>

      <Text style={styles.subtitle}>
        Controle seus gastos do mês de forma simples: organize por prioridade,
        categoria e forma de pagamento.
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      alignItems: "center",
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 10,
    },
    title: {
      marginTop: 24,
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.text,
    },
    titleHighlight: {
      color: colors.primary,
    },
    subtitle: {
      marginTop: 12,
      fontSize: 15,
      textAlign: "center",
      lineHeight: 22,
      color: colors.textSecondary,
    },
  });
