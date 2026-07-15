import { useMemo, useState, useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useTheme } from "@/context/theme.context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { matchesSearch } from "@/lib/text.utils";
import { getProductMonthYear } from "@/lib/product.utils";
import type { ProductResponse } from "@app/shared";

import { HomeSummaryCard } from "./home-summary-card";
import { HomeFilters } from "./home-filters";
import { HomeMonthYearFilter } from "./home-month-year-filter";
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
  showDashboard?: boolean;
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
  showDashboard = false,
}: ItemListScreenProps) {
  const { colors } = useTheme();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [userFilter, setUserFilter] = useState<string>(ALL_USERS_VALUE);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 250);

  useEffect(() => {
    if (products.length === 0) return;
    if (selectedMonth !== null || selectedYear !== null) return;

    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    const hasNow = products.some((p) => {
      const my = getProductMonthYear(p.date);
      return my && my.month === cm && my.year === cy;
    });

    if (hasNow) {
      setSelectedMonth(cm);
      setSelectedYear(cy);
    }
  }, [products, selectedMonth, selectedYear]);

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
      // Filter by month/year if selected
      try {
        const my = (() => {
          const dmMatch = product.date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (dmMatch) return { month: Number(dmMatch[2]) - 1, year: Number(dmMatch[3]) };
          const isoMatch = product.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (isoMatch) return { month: Number(isoMatch[2]) - 1, year: Number(isoMatch[1]) };
          const d = new Date(product.date);
          if (!isNaN(d.getTime())) return { month: d.getMonth(), year: d.getFullYear() };
          return null;
        })();

        if (selectedMonth !== null && my && my.month !== selectedMonth) return false;
        if (selectedYear !== null && my && my.year !== selectedYear) return false;
      } catch (e) {
        // ignore parse errors and don't filter out
      }
      if (!matchesSearch(product.name, search)) {
        return false;
      }
      return true;
    });
  }, [products, statusFilter, userFilter, search, selectedMonth, selectedYear]);

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
      <AppShell title={title} subtitle={subtitle} showDashboard={showDashboard}>
        <LoadingState message="Carregando produtos…" />
      </AppShell>
    );
  }

  if (error && products.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle} showDashboard={showDashboard}>
        <ErrorState error={error} onRetry={onRefresh} />
      </AppShell>
    );
  }

  return (
    <AppShell title={title} subtitle={subtitle} showDashboard={showDashboard}>
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
          <HomeMonthYearFilter
            products={products}
            month={selectedMonth}
            year={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />
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