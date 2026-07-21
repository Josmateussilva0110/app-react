import React, { memo, useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { formatBRL, type Priority } from "@/lib/storage";
import {
  formatProductDate,
  getPaymentLabel,
} from "@/lib/product.utils";
import { categoryMeta } from "@/features/dashboard/constants";
import { ProductResponse } from "@app/shared";
import { useTheme } from "@/context/theme.context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";

type Product = ProductResponse;

type ProductCardProps = {
  p: Product;
  onDelete?: (id: string) => void;
};

const priorityConfig: Record<
  Priority,
  { color: string; label: string }
> = {
  alta: { color: "#ef4444", label: "Alta" },
  media: { color: "#f59e0b", label: "Média" },
  baixa: { color: "#22c55e", label: "Baixa" },
};

function StatusIndicator({ finished }: { finished: boolean }) {
  const { colors: theme } = useTheme();

  return (
    <View style={styles.statusRow}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: finished ? theme.success : theme.warning },
        ]}
      />
      <Text style={[styles.statusText, { color: theme.textSecondary }]}>
        {finished ? "Comprado" : "Pendente"}
      </Text>
    </View>
  );
}

function PriorityOutline({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={[styles.priorityOutline, { borderColor: color }]}>
      <View style={[styles.priorityDot, { backgroundColor: color }]} />
      <Text style={[styles.priorityLabel, { color }]}>{label}</Text>
    </View>
  );
}

function splitPrice(price: number): { main: string; cents: string } {
  const formatted = formatBRL(price);
  const numeric = formatted.replace("R$", "").trim();
  const [main, cents = "00"] = numeric.split(",");
  return { main, cents };
}

export const ProductCard = memo(function ProductCard({
  p,
}: ProductCardProps): React.JSX.Element {
  const { colors: theme } = useTheme();
  const router = useRouter();

  const priority = priorityConfig[p.priority];
  const category = useMemo(() => categoryMeta(p.category), [p.category]);
  const CategoryIcon = category.icon;
  const finished = p.finished;
  const priceParts = splitPrice(p.price);

  const handlePress = useCallback(() => {
    router.push(`/(protected)/product-detail/${p.id}` as never);
  }, [router, p.id]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryIconWrap,
                {
                  backgroundColor: `${category.color}18`,
                  borderColor: `${category.color}40`,
                },
              ]}
            >
              <CategoryIcon size={14} color={category.color} />
            </View>
            <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>
              {category.label.toUpperCase()}
            </Text>
          </View>
          <StatusIndicator finished={finished} />
        </View>

        <Text
          style={[
            styles.name,
            { color: theme.cardName },
          ]}
        >
          {p.name}
        </Text>

        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {getPaymentLabel(p.payment_type)} · {formatProductDate(p.date)}
        </Text>
      </View>

      <View style={[styles.separator, { backgroundColor: theme.border }]} />

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <PriorityOutline
            color={priority.color}
            label={priority.label}
          />
          {p.user_name ? (
            <Text style={[styles.userName, { color: theme.textSecondary }]}>
              {p.user_name}
            </Text>
          ) : null}
        </View>

        <Text
          style={[
            styles.price,
            { color: theme.primary },
          ]}
        >
          R$ {priceParts.main}
          <Text style={[styles.priceCents, { color: theme.textSecondary }]}>
            ,{priceParts.cents}
          </Text>
        </Text>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 10,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 23,
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 12,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    flexWrap: "wrap",
  },
  priorityOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  userName: {
    fontSize: 12,
    fontWeight: "500",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  priceCents: {
    fontSize: 13,
    fontWeight: "600",
  },
});
