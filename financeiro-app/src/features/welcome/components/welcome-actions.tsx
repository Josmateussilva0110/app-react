import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { LogIn, UserPlus } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function WelcomeActions() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Link href="/login" asChild>
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <LogIn size={20} color="#fff" />
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/register" asChild>
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <UserPlus size={20} color="#fff" />
          <Text style={styles.buttonText}>Criar conta</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: 32,
      gap: 12,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    buttonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 16,
    },
  });
