import { useMemo, useState, useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useTheme } from "@/context/theme.context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useGroupMode } from "@/features/group/hooks/use-group-mode";
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
import type { InitialListFilters, StatusFilter } from "../constants/home.constants";

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
  initialFilters?: InitialListFilters;
  /** Notifica o pai para refetch com filtros no GET /products. */
  onQueryFiltersChange?: (filters: InitialListFilters) => void;
  /**
   * Quando true, month/year/status/user já vieram filtrados da API;
   * a lista só aplica busca local e mantém os chips em sync.
   */
  serverFiltered?: boolean;
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
  initialFilters,
  onQueryFiltersChange,
  serverFiltered = false,
}: ItemListScreenProps) {
  const { colors } = useTheme();
  const { inGroup } = useGroupMode();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialFilters?.status ?? "todos"
  );
  const [userFilter, setUserFilter] = useState<string>(
    initialFilters?.userId ?? ALL_USERS_VALUE
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    initialFilters?.month ?? null
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    initialFilters?.year ?? null
  );
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 250);

  // Substitui o snapshot completo (não faz patch): campos omitidos voltam ao default.
  useEffect(() => {
    if (!initialFilters) return;

    setStatusFilter(initialFilters.status ?? "todos");
    setUserFilter(initialFilters.userId ?? ALL_USERS_VALUE);
    setSelectedMonth(
      initialFilters.month !== undefined ? initialFilters.month : null
    );
    setSelectedYear(
      initialFilters.year !== undefined ? initialFilters.year : null
    );
  }, [
    initialFilters,
    initialFilters?.status,
    initialFilters?.userId,
    initialFilters?.month,
    initialFilters?.year,
  ]);

  useEffect(() => {
    if (serverFiltered) return;
    if (initialFilters?.month !== undefined || initialFilters?.year !== undefined) return;
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
  }, [
    products,
    selectedMonth,
    selectedYear,
    initialFilters?.month,
    initialFilters?.year,
    serverFiltered,
  ]);

  const emitQueryFilters = (next: {
    status?: StatusFilter;
    userId?: string;
    month?: number | null;
    year?: number | null;
  }) => {
    if (!onQueryFiltersChange) return;

    const nextStatus = next.status ?? statusFilter;
    const nextUser = next.userId !== undefined ? next.userId : userFilter;
    const nextMonth = next.month !== undefined ? next.month : selectedMonth;
    const nextYear = next.year !== undefined ? next.year : selectedYear;

    onQueryFiltersChange({
      status: nextStatus,
      userId: nextUser === ALL_USERS_VALUE ? undefined : nextUser,
      month: nextMonth,
      year: nextYear,
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!serverFiltered) {
        if (
          statusFilter !== "todos" &&
          product.finished !== (statusFilter === "finalizado")
        ) {
          return false;
        }
        if (userFilter !== ALL_USERS_VALUE && product.user_id !== userFilter) {
          return false;
        }
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
        } catch {
          // ignore parse errors
        }
      }
      if (!matchesSearch(product.name, search)) {
        return false;
      }
      return true;
    });
  }, [
    products,
    statusFilter,
    userFilter,
    search,
    selectedMonth,
    selectedYear,
    serverFiltered,
  ]);

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

          <HomeFilters
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              emitQueryFilters({ status: value });
            }}
          />
          <HomeMonthYearFilter
            products={products}
            month={selectedMonth}
            year={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
              emitQueryFilters({ month: m, year: y });
            }}
          />
          {inGroup && (
            <HomeUserFilter
              products={products}
              value={userFilter}
              onChange={(value) => {
                setUserFilter(value);
                emitQueryFilters({
                  userId: value === ALL_USERS_VALUE ? ALL_USERS_VALUE : value,
                });
              }}
            />
          )}

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
