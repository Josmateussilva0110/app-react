import { View, Text, StyleSheet } from "react-native";
import {
  Flame,
  Clock,
  Leaf,
  type LucideIcon,
} from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { formatBRL, type Priority, type Product } from "@/lib/storage";

const priorityMeta: Record<
  Priority,
  { icon: LucideIcon; label: string; color: string; bgColor: string; borderColor: string }
> = {
  alta: {
    icon: Flame,
    label: "Alta Prioridade",
    color: "#ef4444",
    bgColor: "#ef444415",
    borderColor: "#ef444430",
  },
  media: {
    icon: Clock,
    label: "Média Prioridade",
    color: "#f59e0b",
    bgColor: "#f59e0b15",
    borderColor: "#f59e0b30",
  },
  baixa: {
    icon: Leaf,
    label: "Baixa Prioridade",
    color: "#22c55e",
    bgColor: "#22c55e15",
    borderColor: "#22c55e30",
  },
};

interface Props {
  product: Product;
}

export function ProductDetailHeader({ product }: Props) {
  const { colors } = useTheme();
  const meta = priorityMeta[product.prioridade];
  const Icon = meta.icon;

  return (
    <View style={styles.container}>
      {/* Priority accent bar */}
      <View style={[styles.accentBar, { backgroundColor: meta.color }]} />

      {/* Priority badge */}
      <View
        style={[
          styles.priorityBadge,
          {
            backgroundColor: meta.bgColor,
            borderColor: meta.borderColor,
          },
        ]}
      >
        <Icon size={14} color={meta.color} />
        <Text style={[styles.priorityText, { color: meta.color }]}>
          {meta.label}
        </Text>
      </View>

      {/* Product name */}
      <Text style={[styles.name, { color: colors.text }]}>
        {product.nome}
      </Text>

      {/* Price */}
      <Text style={[styles.price, { color: colors.primary }]}>
        {formatBRL(product.preco)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  accentBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});
