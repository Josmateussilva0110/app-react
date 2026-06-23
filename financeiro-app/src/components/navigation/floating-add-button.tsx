import { StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export function FloatingAddButton() {
  return (
    <LinearGradient
      colors={["#22C55E", "#16A34A"]}
      style={styles.button}
    >
      <Plus
        size={26}
        color="#fff"
        strokeWidth={2.5}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 4,
    borderColor: "#FFF",

    elevation: 12,
  },
});