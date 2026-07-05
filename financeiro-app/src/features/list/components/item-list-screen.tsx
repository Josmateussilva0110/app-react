import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useTheme } from "@/context/theme.context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { matchesSearch } from "@/lib/text.utils";
import type { ProductResponse } from "@app/shared";

import { HomeSummaryCard } from "./home-summary-card";
import { HomeFilters } from "./home-filters";
import { HomeSearchInput } from "./home-search-input";
import { HomeUserFilter, ALL_USERS_VALUE } from "./home-user-filter";
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
  const [userFilter, setUserFilter] = useState<string>(ALL_USERS_VALUE);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 250);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (
        statusFilter !== "todos" &&
        product.finished !== (statusFilter === "finalizado")
      ) {
        return false;
      }
      if (userFilter !== ALL_USERS_VALUE && product.user_id !== userFilter) {
        return false;
      }
      if (!matchesSearch(product.name, search)) {
        return false;
      }
      return true;
    });
  }, [products, statusFilter, userFilter, search]);

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

          <HomeSearchInput value={searchInput} onChange={setSearchInput} />

          <HomeFilters value={statusFilter} onChange={setStatusFilter} />

          <HomeUserFilter
            products={products}
            value={userFilter}
            onChange={setUserFilter}
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
});