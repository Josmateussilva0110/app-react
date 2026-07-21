import { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppShell } from "@/components/appShell";
import { ProductCard } from "@/components/productCard";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useTheme } from "@/context/theme.context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useGroupMode } from "@/features/group/hooks/use-group-mode";
import type { EnrichedProduct } from "@/hooks/use-products";
import { useProductStats } from "@/hooks/use-product-stats";
import { matchesSearch } from "@/lib/text.utils";
import { getProductMonthYear } from "@/lib/product.utils";
import { HomeSummaryCard } from "./home-summary-card";
import { HomeSegmentedFilter } from "./home-segmented-filter";
import { HomeMonthYearFilter } from "./home-month-year-filter";
import { HomeSearchInput } from "./home-search-input";
import { HomeUserFilter, ALL_USERS_VALUE } from "./home-user-filter";
import { HomePrioritySectionHeader } from "./home-priority-section-header";
import { HomeEmptyState } from "./home-empty-state";
import { PRIORITY_GROUPS, type InitialListFilters, type StatusFilter } from "../constants/home.constants";

export type ListSummaryFilters = {
  month: number;
  year: number;
  userId?: string;
  status?: StatusFilter;
  monthList?: "true" | "false";
};

type ItemListScreenProps = {
  title: string;
  subtitle: string;
  products: EnrichedProduct[];
  loading?: boolean;
  isRefreshing?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  error?: string | null;
  onRefresh?: () => void;
  showSummary?: boolean;
  showFab?: boolean;
  showDashboard?: boolean;
  initialFilters?: InitialListFilters;
  onQueryFiltersChange?: (filters: InitialListFilters) => void;
  serverFiltered?: boolean;
  /** Quando definido, o resumo usa /products/stats (total e contagem corretos). */
  summaryFilters?: ListSummaryFilters;
};

type PrioritySection = {
  key: string;
  group: (typeof PRIORITY_GROUPS)[number];
  data: EnrichedProduct[];
};

function getProductMonthYearValue(product: EnrichedProduct) {
  if (product._month !== null && product._year !== null) {
    return { month: product._month, year: product._year };
  }
  return getProductMonthYear(product.date);
}

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
  summaryFilters,
  isRefreshing = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
}: ItemListScreenProps) {
  const { colors } = useTheme();
  const { inGroup, group } = useGroupMode();
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

  const initialStatus = initialFilters?.status ?? "todos";
  const initialUserId = initialFilters?.userId ?? ALL_USERS_VALUE;
  const initialMonth =
    initialFilters?.month !== undefined ? initialFilters.month : null;
  const initialYear =
    initialFilters?.year !== undefined ? initialFilters.year : null;

  useEffect(() => {
    if (!initialFilters) return;

    setStatusFilter(initialStatus);
    setUserFilter(initialUserId);
    setSelectedMonth(initialMonth);
    setSelectedYear(initialYear);
  }, [initialFilters, initialStatus, initialUserId, initialMonth, initialYear]);

  useEffect(() => {
    if (serverFiltered) return;
    if (initialFilters?.month !== undefined || initialFilters?.year !== undefined) return;
    if (products.length === 0) return;
    if (selectedMonth !== null || selectedYear !== null) return;

    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    const hasNow = products.some((product) => {
      const my = getProductMonthYearValue(product);
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

  const canUseServerStats =
    summaryFilters !== undefined ||
    (serverFiltered && selectedMonth !== null && selectedYear !== null);

  const statsMonth =
    summaryFilters?.month ??
    (selectedMonth !== null ? selectedMonth + 1 : new Date().getMonth() + 1);
  const statsYear =
    summaryFilters?.year ??
    selectedYear ??
    new Date().getFullYear();
  const statsUserId =
    summaryFilters?.userId ??
    (userFilter !== ALL_USERS_VALUE ? userFilter : undefined);
  const statsMonthList = summaryFilters?.monthList;
  const statsStatusForTotal = summaryFilters?.status ?? "todos";
  const needsBreakdownStats = statsStatusForTotal !== "todos";

  const { data: totalStats } = useProductStats({
    month: statsMonth,
    year: statsYear,
    userId: statsUserId,
    status: statsStatusForTotal,
    monthList: statsMonthList,
    enabled: canUseServerStats,
  });

  const { data: breakdownStats } = useProductStats({
    month: statsMonth,
    year: statsYear,
    userId: statsUserId,
    status: "todos",
    monthList: statsMonthList,
    enabled: canUseServerStats && needsBreakdownStats,
  });

  const statsForBreakdown =
    needsBreakdownStats ? breakdownStats : totalStats;

  const listMetrics = useMemo(() => {
    const grouped = new Map<string, EnrichedProduct[]>();
    let total = 0;
    let overviewTotal = 0;
    let pendingCount = 0;
    let finishedCount = 0;

    for (const product of products) {
      const passesScope = (() => {
        if (serverFiltered) return true;
        if (userFilter !== ALL_USERS_VALUE && product.user_id !== userFilter) {
          return false;
        }
        const my = getProductMonthYearValue(product);
        if (selectedMonth !== null && my && my.month !== selectedMonth) return false;
        if (selectedYear !== null && my && my.year !== selectedYear) return false;
        return true;
      })();

      if (passesScope && matchesSearch(product.name, search)) {
        overviewTotal += product.price;
        if (product.finished) finishedCount += 1;
        else pendingCount += 1;
      }

      if (!serverFiltered) {
        if (
          statusFilter !== "todos" &&
          product.finished !== (statusFilter === "finalizado")
        ) {
          continue;
        }
        if (!passesScope) continue;
      }

      if (!matchesSearch(product.name, search)) {
        continue;
      }

      total += product.price;

      const items = grouped.get(product.priority) ?? [];
      items.push(product);
      grouped.set(product.priority, items);
    }

    const sections: PrioritySection[] = PRIORITY_GROUPS.map((groupDef) => ({
      key: groupDef.key,
      group: groupDef,
      data: grouped.get(groupDef.key) ?? [],
    })).filter((section) => section.data.length > 0);

    return {
      sections,
      total,
      overviewTotal,
      pendingCount,
      finishedCount,
      itemCount: sections.reduce((sum, section) => sum + section.data.length, 0),
    };
  }, [
    products,
    statusFilter,
    userFilter,
    search,
    selectedMonth,
    selectedYear,
    serverFiltered,
  ]);

  const groupMembers = useMemo(
    () =>
      group?.members.map((member) => ({
        id: member.id,
        name: member.name,
      })) ?? [],
    [group?.members]
  );

  const summaryTotal = canUseServerStats && totalStats
    ? totalStats.total
    : statusFilter !== "todos"
      ? listMetrics.total
      : listMetrics.overviewTotal;
  const summaryPending = canUseServerStats && statsForBreakdown
    ? statsForBreakdown.pendingCount
    : listMetrics.pendingCount;
  const summaryFinished = canUseServerStats && statsForBreakdown
    ? statsForBreakdown.itemsCount - statsForBreakdown.pendingCount
    : listMetrics.finishedCount;

  const listHeader = (
    <View style={styles.headerContent}>
      {showSummary && (
        <HomeSummaryCard
          total={summaryTotal}
          pendingCount={summaryPending}
          finishedCount={summaryFinished}
        />
      )}

      <HomeSearchInput value={searchInput} onChange={setSearchInput} />

      <HomeSegmentedFilter
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
        serverFiltered={serverFiltered}
        onChange={(m, y) => {
          setSelectedMonth(m);
          setSelectedYear(y);
          emitQueryFilters({ month: m, year: y });
        }}
      />
      {inGroup && (
        <HomeUserFilter
          members={groupMembers}
          value={userFilter}
          onChange={(value) => {
            setUserFilter(value);
            emitQueryFilters({
              userId: value === ALL_USERS_VALUE ? ALL_USERS_VALUE : value,
            });
          }}
        />
      )}
    </View>
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
    <AppShell
      title={title}
      subtitle={subtitle}
      showDashboard={showDashboard}
    >
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <SectionList
          sections={listMetrics.sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard p={item} />}
          renderSectionHeader={({ section }) => (
            <HomePrioritySectionHeader
              group={section.group}
              count={section.data.length}
            />
          )}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<HomeEmptyState />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          onEndReached={() => onLoadMore?.()}
          onEndReachedThreshold={0.35}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            ) : undefined
          }
        />
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
  headerContent: {
    gap: 20,
    marginBottom: 8,
  },
  footerLoader: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
