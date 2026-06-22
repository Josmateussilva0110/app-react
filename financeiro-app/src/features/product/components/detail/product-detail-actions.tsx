import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pencil, Trash2 } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

interface Props {
  productName: string;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export function ProductDetailActions({ productName, onEdit, onDelete, deleting = false }: Props) {
  const { colors } = useTheme();

  function handleDelete() {
    Alert.alert(
      "Remover item",
      `Deseja remover "${productName}"?\nEsta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover",  style: "destructive", onPress: onDelete },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Editar — gradient primário */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onEdit}
        disabled={deleting}
        style={[styles.editWrap, deleting && styles.disabled]}
      >
        <LinearGradient
          colors={[colors.fabGradientStart, colors.fabGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.editBtn}
        >
          <Pencil size={16} color="#fff" strokeWidth={2.5} />
          <Text style={styles.editText}>Editar Item</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Remover — outlined danger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleDelete}
        disabled={deleting}
        style={[
          styles.deleteBtn,
          {
            backgroundColor: `${colors.error}0C`,
            borderColor: `${colors.error}28`,
          },
          deleting && styles.disabled,
        ]}
      >
        <Trash2 size={16} color={colors.error} strokeWidth={2.5} />
        <Text style={[styles.deleteText, { color: colors.error }]}>
          {deleting ? "Removendo…" : "Remover Item"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 4,
  },
  disabled: {
    opacity: 0.65,
  },
  editWrap: {
    borderRadius: 18,
    overflow: "hidden",
  },
  editBtn: {
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  editText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  deleteBtn: {
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});