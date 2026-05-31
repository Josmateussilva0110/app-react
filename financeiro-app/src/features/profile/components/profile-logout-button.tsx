import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LogOut } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function ProfileLogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const { show } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleLogout = async () => {
    await logout();
    show("success", "Logout realizado com sucesso");
  };

  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.8}
      onPress={handleLogout}
    >
      <LogOut size={18} color={colors.error} />
      <Text style={styles.text}>Sair da conta</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    text: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.error,
    },
  });