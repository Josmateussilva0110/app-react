import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  User,
  Calendar,
} from "lucide-react-native";

import {
  formatBRL,
  type Priority,
} from "@/lib/storage";
import { formatProductDate, getCategoryLabel } from "@/lib/product.utils";

import { ProductResponse } from "@app/shared";

type Product = ProductResponse;

import { useTheme } from "@/context/theme.context";
import { useRouter } from "expo-router";

type ProductCardProps = {
  p: Product;
  onDelete?: (id: string) => void;
};

const priorityConfig: Record<
  Priority,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
  }
> = {
  alta: {
    color: "#ef4444",
    bgColor: "#ef444415",
    borderColor: "#ef444430",
    label: "Alta",
  },

  media: {
    color: "#f59e0b",
    bgColor: "#f59e0b15",
    borderColor: "#f59e0b30",
    label: "Média",
  },

  baixa: {
    color: "#22c55e",
    bgColor: "#22c55e15",
    borderColor: "#22c55e30",
    label: "Baixa",
  },
};

export const ProductCard = memo(function ProductCard({
  p,
}: ProductCardProps): React.JSX.Element {
  const { colors: theme } = useTheme();
  const router = useRouter();

  const config = priorityConfig[p.priority];

  const handlePress = useCallback(() => {
    router.push(`/(protected)/product-detail/${p.id}` as any);
  }, [router, p.id]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
    >
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            theme.cardBackground,
          borderColor:
            config.borderColor,
        },
      ]}
    >
      {/* Accent */}
      <View
        style={[
          styles.accentBar,
          {
            backgroundColor:
              config.color,
          },
        ]}
      />

      <View style={styles.cardInner}>
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: config.bgColor,
              },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: config.color },
              ]}
            >
              {config.label}
            </Text>
          </View>

          <View style={styles.rightHeader}>
            {/* User */}
            <View
              style={[
                styles.userBadge,
                {
                  backgroundColor:
                    theme.userBadgeBg,
                },
              ]}
            >
              <User
                size={13}
                color={
                  theme.userBadgeIcon
                }
              />

              <Text
                style={[
                  styles.userText,
                  {
                    color:
                      theme.userBadgeText,
                  },
                ]}
              >
                {p.user_name}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.infoBlock}>
            <Text
              style={[
                styles.name,
                {
                  color:
                    theme.cardName,
                },
              ]}
              numberOfLines={1}
            >
              {p.name}
            </Text>

            <Text
              style={[
                styles.price,
                {
                  color:
                    theme.cardPrice,
                },
              ]}
            >
              {formatBRL(p.price)}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={12} color={theme.textSecondary} />
                <Text
                  style={[styles.metaText, { color: theme.textSecondary }]}
                >
                  {formatProductDate(p.date)}
                </Text>
              </View>

              <Text
                style={[styles.metaDot, { color: theme.textSecondary }]}
              >
                •
              </Text>

              <Text
                style={[styles.metaText, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {getCategoryLabel(p.category)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },

  accentBar: {
    width: 5,
  },

  cardInner: {
    flex: 1,
    padding: 16,
    gap: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
  },

  rightHeader: {
    alignItems: "flex-end",
    gap: 10,
  },

  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  priorityText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  userText: {
    fontSize: 12,
    fontWeight: "600",
  },

  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    gap: 12,
  },

  infoBlock: {
    gap: 4,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  price: {
    fontSize: 16,
    fontWeight: "600",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },

  metaDot: {
    fontSize: 12,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#27272a",
  },

  chevronWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
