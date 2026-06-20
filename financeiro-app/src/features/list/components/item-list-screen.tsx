import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import { useTheme } from "@/context/theme.context";
import type { ProductResponse } from "@app/shared";

import { HomeSummaryCard } from "./home-summary-card";
import { HomeFilters } from "./home-filters";
import { HomePriorityList } from "./home-priority-list";
import { HomeEmptyState } from "./home-empty-state";
import type { StatusFilter } from "../constants/home.constants";

type ItemListScreenProps = {
  title: string;
  subtitle: string;
  products: ProductResponse[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  showSummary?: boolean;
  showFab?: boolean;
};

export function ItemListScreen({
  title,
  subtitle,
  products,
  loading = false,
  error = null,
  onRefresh,
  showSummary = true,
  showFab = true,
}: ItemListScreenProps) {
  const { colors } = useTheme();
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("todos");

  const filteredProducts = useMemo(() => {
    if (statusFilter === "todos") {
      return products;
    }

    return products.filter(
      (product) => product.finished === (statusFilter === "finalizado")
    );
  }, [products, statusFilter]);

  const total = useMemo(
    () =>
      filteredProducts.reduce(
        (sum, product) => sum + product.price,
        0
      ),
    [filteredProducts]
  );

  const highCount = useMemo(
    () =>
      filteredProducts.filter(
        (product) => product.priority === "alta"
      ).length,
    [filteredProducts]
  );

  if (loading && products.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando produtos…
          </Text>
        </View>
      </AppShell>
    );
  }

  if (error && products.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              activeOpacity={0.7}
              style={[styles.retryBtn, { borderColor: colors.primary }]}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title={title} subtitle={subtitle}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={loading}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            ) : undefined
          }
        >
          {showSummary && (
            <HomeSummaryCard
              total={total}
              itemCount={filteredProducts.length}
              highCount={highCount}
            />
          )}

          <HomeFilters
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {filteredProducts.length === 0 ? (
            <HomeEmptyState />
          ) : (
            <HomePriorityList products={filteredProducts} />
          )}
        </ScrollView>
      </SafeAreaView>
    </AppShell>
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
