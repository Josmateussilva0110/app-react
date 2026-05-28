import { Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

export function HomeFab() {
  const { colors: theme } = useTheme();

  return (
    <Link href="/" asChild>
      <Pressable style={styles.fab}>
        <LinearGradient
          colors={[theme.fabGradientStart, theme.fabGradientEnd]}
          style={styles.gradient}
        >
          <Plus size={22} color="#ffffff" strokeWidth={2.5} />
        </LinearGradient>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 70,
    right: 20,
  },
  gradient: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
});