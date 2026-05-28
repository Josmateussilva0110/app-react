import { useMemo, useState } from "react";

import { Link } from "expo-router";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";

import {
  ArrowDownCircle,
  Flame,
  Clock,
  Leaf,
  Plus,
  TrendingDown,
  Package,
  Clock3,
  Check,
} from "lucide-react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import { AppShell } from "@/components/appShell";
import { ProductCard } from "@/components/productCard";
import { FilterChip } from "@/components/ui/filter-chips";

import { useTheme } from "@/context/theme.context";

import {
  useProducts,
  formatBRL,
  type Priority,
} from "@/lib/storage";

type Group = {
  key: Priority;
  label: string;
  icon: typeof Flame;
  color: string;
  bgColor: string;
};

type StatusFilter =
  | "todos"
  | "pendente"
  | "finalizado";

const groups: Group[] = [
  {
    key: "alta",
    label: "Alta",
    icon: Flame,
    color: "#ef4444",
    bgColor: "#ef444418",
  },

  {
    key: "media",
    label: "Média",
    icon: Clock,
    color: "#f59e0b",
    bgColor: "#f59e0b18",
  },

  {
    key: "baixa",
    label: "Baixa",
    icon: Leaf,
    color: "#22c55e",
    bgColor: "#22c55e18",
  },
];

export default function HomeScreen(): React.JSX.Element {
  const products = useProducts();

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("todos");

  const { colors: theme } = useTheme();

  const filteredProducts = useMemo(() => {
    if (statusFilter === "todos") {
      return products;
    }

    return products.filter(
      (product) =>
        product.status ===
        statusFilter
    );
  }, [products, statusFilter]);

  const total = useMemo<number>(() => {
    return filteredProducts.reduce(
      (sum: number, product) =>
        sum + product.preco,
      0
    );
  }, [filteredProducts]);

  const highCount =
    filteredProducts.filter(
      (p) => p.prioridade === "alta"
    ).length;

  return (
    <AppShell
      title="Meus Gastos"
      subtitle="Controle seus itens por prioridade"
    >
      <SafeAreaView
        style={styles.container}
        edges={["bottom"]}
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* Hero Card */}
          <LinearGradient
            colors={[
              theme.summaryGradientStart,
              theme.summaryGradientMid,
              theme.summaryGradientEnd,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.decorCircle,
                {
                  backgroundColor:
                    theme.summaryDecorCircle,
                },
              ]}
            />

            <View
              style={styles.summaryTopRow}
            >
              <View
                style={
                  styles.summaryLabelRow
                }
              >
                <TrendingDown
                  size={14}
                  color={
                    theme.summaryLabel
                  }
                />

                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color:
                        theme.summaryLabel,
                    },
                  ]}
                >
                  Total cadastrado
                </Text>
              </View>

              <View
                style={[
                  styles.itemCountBadge,
                  {
                    backgroundColor:
                      theme.summaryItemBadgeBg,
                    borderColor:
                      theme.summaryItemBadgeBorder,
                  },
                ]}
              >
                <Package
                  size={12}
                  color={
                    theme.summaryItemBadgeText
                  }
                />

                <Text
                  style={[
                    styles.itemCountText,
                    {
                      color:
                        theme.summaryItemBadgeText,
                    },
                  ]}
                >
                  {filteredProducts.length}{" "}
                  {filteredProducts.length ===
                  1
                    ? "item"
                    : "itens"}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    theme.summaryValue,
                },
              ]}
            >
              {formatBRL(total)}
            </Text>

            {highCount > 0 ? (
              <View
                style={styles.alertRow}
              >
                <Flame
                  size={13}
                  color={
                    theme.alertTextDanger
                  }
                />

                <Text
                  style={[
                    styles.alertText,
                    {
                      color:
                        theme.alertTextDanger,
                    },
                  ]}
                >
                  {highCount}{" "}
                  {highCount === 1
                    ? "item de alta prioridade"
                    : "itens de alta prioridade"}
                </Text>
              </View>
            ) : (
              <View
                style={styles.alertRow}
              >
                <ArrowDownCircle
                  size={13}
                  color={
                    theme.alertTextSuccess
                  }
                />

                <Text
                  style={[
                    styles.alertText,
                    {
                      color:
                        theme.alertTextSuccess,
                    },
                  ]}
                >
                  Tudo sob controle
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Filters */}
          <View
            style={
              styles.filtersContainer
            }
          >
            <FilterChip
  label="Todos"
  icon={Package}
  active={statusFilter === "todos"}
  onPress={() =>
    setStatusFilter("todos")
  }
  activeColor={
    theme.fabGradientStart
  }
  inactiveColor={theme.card}
  textColor={
    statusFilter === "todos"
      ? "#ffffff"
      : theme.text
  }
/>

<FilterChip
  label="Pendentes"
  icon={Clock3}
  active={
    statusFilter === "pendente"
  }
  onPress={() =>
    setStatusFilter("pendente")
  }
  activeColor="#f59e0b"
  inactiveColor={theme.card}
  textColor={
    statusFilter === "pendente"
      ? "#ffffff"
      : theme.text
  }
/>

<FilterChip
  label="Finalizados"
  icon={Check}
  active={
    statusFilter === "finalizado"
  }
  onPress={() =>
    setStatusFilter("finalizado")
  }
  activeColor="#22c55e"
  inactiveColor={theme.card}
  textColor={
    statusFilter === "finalizado"
      ? "#ffffff"
      : theme.text
  }
/>
          </View>

          {/* List */}
          {filteredProducts.length ===
          0 ? (
            <EmptyState />
          ) : (
            <View
              style={
                styles.groupContainer
              }
            >
              {groups.map((group) => {
                const items =
                  filteredProducts.filter(
                    (product) =>
                      product.prioridade ===
                      group.key
                  );

                if (items.length === 0) {
                  return null;
                }

                const Icon =
                  group.icon;

                return (
                  <View
                    key={group.key}
                    style={
                      styles.section
                    }
                  >
                    <View
                      style={
                        styles.sectionHeader
                      }
                    >
                      <View
                        style={
                          styles.sectionTitleContainer
                        }
                      >
                        <View
                          style={[
                            styles.sectionIconWrapper,
                            {
                              backgroundColor:
                                group.bgColor,
                            },
                          ]}
                        >
                          <Icon
                            size={15}
                            color={
                              group.color
                            }
                          />
                        </View>

                        <Text
                          style={[
                            styles.sectionTitle,
                            {
                              color:
                                group.color,
                            },
                          ]}
                        >
                          {group.label}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.countBadge,
                          {
                            backgroundColor:
                              group.bgColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countBadgeText,
                            {
                              color:
                                group.color,
                            },
                          ]}
                        >
                          {items.length}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.productsContainer
                      }
                    >
                      {items.map(
                        (product) => (
                          <ProductCard
                            key={
                              product.id
                            }
                            p={product}
                          />
                        )
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* FAB */}
        <Link
          href="/"
          asChild
        >
          <Pressable style={styles.fab}>
            <LinearGradient
              colors={[
                theme.fabGradientStart,
                theme.fabGradientEnd,
              ]}
              style={
                styles.fabGradient
              }
            >
              <Plus
                size={22}
                color="#ffffff"
                strokeWidth={2.5}
              />
            </LinearGradient>
          </Pressable>
        </Link>
      </SafeAreaView>
    </AppShell>
  );
}

function EmptyState(): React.JSX.Element {
  const { colors: theme } =
    useTheme();

  return (
    <View
      style={[
        styles.emptyContainer,
        {
          backgroundColor:
            theme.emptyBg,
          borderColor:
            theme.emptyBorder,
        },
      ]}
    >
      <View
        style={[
          styles.emptyIconWrapper,
          {
            backgroundColor:
              theme.emptyIconBg,
          },
        ]}
      >
        <Package
          size={36}
          color={theme.emptyIcon}
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          {
            color:
              theme.emptyTitle,
          },
        ]}
      >
        Nenhum gasto cadastrado
      </Text>

      <Text
        style={[
          styles.emptyDescription,
          {
            color:
              theme.emptyDescription,
          },
        ]}
      >
        Adicione seu primeiro produto
        para começar a controlar seus
        gastos.
      </Text>

      <Link
        href="/"
        asChild
      >
        <TouchableOpacity
          style={[
            styles.emptyButton,
            {
              backgroundColor:
                theme.emptyButtonBg,
            },
          ]}
        >
          <Plus
            size={16}
            color="#ffffff"
          />

          <Text
            style={
              styles.emptyButtonText
            }
          >
            Adicionar produto
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },

  /* Summary */
  summaryCard: {
    borderRadius: 28,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },

  decorCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -60,
    right: -60,
  },

  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  summaryLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "600",
  },

  itemCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },

  itemCountText: {
    fontSize: 11,
    fontWeight: "600",
  },

  summaryValue: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 12,
  },

  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  alertText: {
    fontSize: 13,
    fontWeight: "500",
  },

  /* Filters */
  filtersContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  /* Groups */
  groupContainer: {
    gap: 28,
  },

  section: {
    gap: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  productsContainer: {
    gap: 10,
  },

  /* FAB */
  fab: {
    position: "absolute",
    bottom: 70,
    right: 20,
  },

  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  /* Empty */
  emptyContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    gap: 8,
  },

  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },

  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  emptyButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  emptyButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});