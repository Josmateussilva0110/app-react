import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Package, Plus } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

export function HomeEmptyState() {
  const { colors: theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.emptyBg, borderColor: theme.emptyBorder },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.emptyIconBg }]}>
        <Package size={36} color={theme.emptyIcon} />
      </View>

      <Text style={[styles.title, { color: theme.emptyTitle }]}>
        Nenhum gasto cadastrado
      </Text>

      <Text style={[styles.description, { color: theme.emptyDescription }]}>
        Adicione seu primeiro produto para começar a controlar seus gastos.
      </Text>

      <Link href="/" asChild>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.emptyButtonBg }]}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.buttonText}>Adicionar produto</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});