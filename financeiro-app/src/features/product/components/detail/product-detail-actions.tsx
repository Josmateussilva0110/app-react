import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pencil, Trash2 } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

interface Props {
  productName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductDetailActions({ productName, onEdit, onDelete }: Props) {
  const { colors } = useTheme();

  function handleDelete() {
    Alert.alert(
      "Remover item",
      `Deseja remover "${productName}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Edit button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onEdit}
        style={styles.editWrap}
      >
        <LinearGradient
          colors={[colors.fabGradientStart, colors.fabGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.editButton}
        >
          <Pencil size={18} color="#fff" />
          <Text style={styles.editText}>Editar Produto</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Delete button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleDelete}
        style={[
          styles.deleteButton,
          {
            backgroundColor: colors.cardBackground,
            borderColor: `${colors.error}30`,
          },
        ]}
      >
        <Trash2 size={18} color={colors.error} />
        <Text style={[styles.deleteText, { color: colors.error }]}>
          Remover
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  editWrap: {
    borderRadius: 16,
    overflow: "hidden",
  },
  editButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  deleteButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  deleteText: {
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
