import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const filteredProducts = useMemo(() => {
    if (statusFilter === "todos") return products;
    return products.filter(
      (product) => product.finished === (statusFilter === "finalizado")
    );
  }, [products, statusFilter]);

  const total = useMemo(
    () => filteredProducts.reduce((sum, p) => sum + p.price, 0),
    [filteredProducts]
  );

  const highCount = useMemo(
    () => filteredProducts.filter((p) => p.priority === "alta").length,
    [filteredProducts]
  );

  if (loading && products.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <LoadingState message="Carregando produtos…" />
      </AppShell>
    );
  }

  if (error && products.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <ErrorState error={error} onRetry={onRefresh} />
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

          <HomeFilters value={statusFilter} onChange={setStatusFilter} />

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
});
