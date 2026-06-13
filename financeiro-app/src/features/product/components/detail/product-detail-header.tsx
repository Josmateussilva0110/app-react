import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Flame,
  Clock,
  Leaf,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/theme.context";
import { formatBRL, type Priority, type Product } from "@/lib/storage";

const PRIORITY_CONFIG: Record<
  Priority,
  { icon: LucideIcon; label: string; color: string }
> = {
  alta:  { icon: Flame, label: "Alta Prioridade",  color: "#ef4444" },
  media: { icon: Clock, label: "Média Prioridade", color: "#f59e0b" },
  baixa: { icon: Leaf,  label: "Baixa Prioridade", color: "#22c55e" },
};

interface Props {
  product: Product;
  onBack: () => void;
}

export function ProductDetailHeader({ product, onBack }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const cfg = PRIORITY_CONFIG[product.prioridade];
  const Icon = cfg.icon;

  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      {/* Priority-color gradient wash — the signature element */}
      <LinearGradient
        colors={[`${cfg.color}20`, `${cfg.color}05`, "transparent"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Nav bar */}
      <View style={styles.nav}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={[
            styles.backBtn,
            {
              backgroundColor: `${colors.cardBackground}D0`,
              borderColor: colors.cardBorderDefault,
            },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={17} color={colors.text} strokeWidth={2.2} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: colors.textSecondary }]}>
          Detalhes
        </Text>

        {/* Mirror do back button para centralizar título */}
        <View style={styles.navMirror} />
      </View>

      {/* Hero content */}
      <View style={styles.content}>
        {/* Priority badge */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${cfg.color}15`,
              borderColor: `${cfg.color}35`,
            },
          ]}
        >
          <Icon size={11} color={cfg.color} strokeWidth={2.5} />
          <Text style={[styles.badgeText, { color: cfg.color }]}>
            {cfg.label.toUpperCase()}
          </Text>
        </View>

        {/* Product name — supporting role */}
        <Text
          style={[styles.productName, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {product.nome}
        </Text>

        {/* Eyebrow label — finance vernacular */}
        <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
          VALOR
        </Text>

        {/* Price — the thesis */}
        <Text
          style={[styles.price, { color: colors.text }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatBRL(product.preco)}
        </Text>
      </View>

      {/* Bottom edge */}
      <View
        style={[
          styles.bottomEdge,
          { backgroundColor: `${cfg.color}25` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    overflow: "hidden",
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 44,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  navMirror: {
    width: 38,
  },
  content: {
    alignItems: "center",
    gap: 8,
    paddingBottom: 36,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  productName: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.1,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginTop: 8,
    opacity: 0.5,
  },
  price: {
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: -2.5,
    textAlign: "center",
    lineHeight: 60,
    maxWidth: 340,
  },
  bottomEdge: {
    height: 1,
    marginHorizontal: -20,
  },
});