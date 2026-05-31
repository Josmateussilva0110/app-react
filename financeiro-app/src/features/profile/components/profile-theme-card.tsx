import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Palette, Sun, Moon } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function ProfileThemeCard() {
  const { mode, colors, setTheme } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Palette size={16} color={colors.primary} />
        <Text style={styles.sectionTitle}>Preferências</Text>
      </View>

      <View style={styles.themeContainer}>
        {/* Claro */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setTheme("light")}
          style={[
            styles.themeButton,
            mode === "light" && styles.themeButtonActive,
          ]}
        >
          <Sun size={18} color={colors.text} />
          <Text style={styles.themeTitle}>Claro</Text>
          <Text style={styles.themeDescription}>Mais luz</Text>
        </TouchableOpacity>

        {/* Escuro */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setTheme("dark")}
          style={[
            styles.themeButton,
            mode === "dark" && styles.themeButtonActive,
          ]}
        >
          <Moon size={18} color={colors.text} />
          <Text style={styles.themeTitle}>Escuro</Text>
          <Text style={styles.themeDescription}>Mais foco</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 24,
      padding: 20,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    themeContainer: {
      flexDirection: "row",
      gap: 12,
    },
    themeButton: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      backgroundColor: colors.background,
      borderColor: colors.backgroundSelected,
    },
    themeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.backgroundSelected,
    },
    themeTitle: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    themeDescription: {
      marginTop: 4,
      fontSize: 12,
      color: colors.textSecondary,
    },
  });