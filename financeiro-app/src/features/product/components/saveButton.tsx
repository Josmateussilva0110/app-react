import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Save } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

interface SaveButtonProps {
  onPress: () => void;
}

export function SaveButton({ onPress }: SaveButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.wrap}>
      <LinearGradient
        colors={[colors.fabGradientStart, colors.fabGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Save size={20} color="#fff" />
        <Text style={styles.text}>Salvar Produto</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
