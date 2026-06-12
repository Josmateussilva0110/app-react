// components/ProductCard.tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import {
  Flame,
  Sparkles,
  Snowflake,
  Trash2,
  ChevronRight,
  User,
} from "lucide-react-native";

import {
  formatBRL,
  type Priority,
  type Product,
} from "@/lib/storage";

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

export function ProductCard({
  p,
  onDelete,
}: ProductCardProps): React.JSX.Element {
  const { colors: theme } = useTheme();
  const router = useRouter();

  const config = priorityConfig[p.prioridade];


  function handleDelete(): void {
    Alert.alert(
      "Remover item",
      `Deseja remover "${p.nome}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },

        {
          text: "Remover",
          style: "destructive",
          onPress: () => onDelete?.(p.id),
        },
      ]
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/(protected)/product-detail/${p.id}` as any)}
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

          {/* Right Side */}
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
                {p.cadastradoPor}
              </Text>
            </View>

            {/* Delete */}
            {onDelete ? (
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor:
                      theme.cardDeleteBg,
                  },
                ]}
                onPress={handleDelete}
                hitSlop={{
                  top: 8,
                  bottom: 8,
                  left: 8,
                  right: 8,
                }}
              >
                <Trash2
                  size={15}
                  color={
                    theme.cardDeleteIcon
                  }
                />
              </TouchableOpacity>
            ) : null}
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
              {p.nome}
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
              {formatBRL(p.preco)}
            </Text>
          </View>
        </View>

        {/* Navigation hint */}
        <View style={styles.footer}>
          <View style={[styles.footerLine, { backgroundColor: theme.cardBorderDefault }]} />
          <View style={[styles.chevronWrapper, { backgroundColor: theme.backgroundElement }]}>
            <ChevronRight size={14} color={theme.cardChevron} />
          </View>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  );
}

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
