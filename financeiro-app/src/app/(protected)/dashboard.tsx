import { useMemo, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { AppShell } from "@/components/appShell";
import { ErrorState } from "@/components/ui/error-state";
import { useTheme } from "@/context/theme.context";
import { useProductStats } from "@/hooks/use-product-stats";
import { useGoal, useUpdateGoal } from "@/hooks/use-goal";
import { useGroupMode } from "@/features/group/hooks/use-group-mode";
import { HomeFilters } from "@/features/list/components/home-filters";
import { MonthListFilters } from "@/features/dashboard/components/month-list-filters";
import { DashboardSelect } from "@/features/dashboard/components/dashboard-select";
import { ALL_USERS, useDashboardFilters } from "@/features/dashboard/hooks/use-dashboard-filters";
import { HorizontalBarChart } from "@/features/dashboard/components/horizontal-bar-chart";
import { VerticalBarChart } from "@/features/dashboard/components/vertical-bar-chart";
import { EvolutionLineChart } from "@/features/dashboard/components/evolution-line-chart";
import { MetaCard } from "@/features/dashboard/components/meta-card";
import { StatCard, SectionCard } from "@/features/dashboard/components/dashboard-cards";
import { CategoryTable } from "@/features/dashboard/components/category-table";
import {
  categoryMeta,
  paymentLabel,
  paymentColor,
  formatBRL,
  MONTHS_FULL,
  USER_SERIES_COLORS,
} from "@/features/dashboard/constants";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const {
    month,
    year,
    userId,
    statusFilter,
    monthListFilter,
    apiUserId,
    apiMonthList,
    yearOptions,
    setMonth,
    setYear,
    setUserId,
    setStatusFilter,
    setMonthListFilter,
  } = useDashboardFilters();

  const { inGroup, groupName } = useGroupMode();
  const dashboardSubtitle = inGroup
    ? `Gastos do grupo ${groupName ?? ""}`
    : "Seus gastos pessoais";

  const {
    data: stats,
    isFetching,
    error,
    refetch,
  } = useProductStats({
    month,
    year,
    userId: apiUserId,
    status: statusFilter,
    monthList: apiMonthList,
  });

  const showSkeleton = !stats;

  const { data: goal } = useGoal();
  const updateGoal = useUpdateGoal();

  const meta = goal?.monthlyGoal ?? 0;

  const monthOptions = MONTHS_FULL.map((m, i) => ({ value: String(i + 1), label: m }));

  const userOptions = useMemo(() => {
    const base = [{ value: ALL_USERS, label: "Todos" }];
    const users = (stats?.users ?? []).map((u) => ({
      value: u.id,
      label: u.name || "Sem nome",
    }));
    return [...base, ...users];
  }, [stats?.users]);

  const categoryItems = useMemo(
    () =>
      (stats?.byCategory ?? []).map((c) => {
        const m = categoryMeta(c.category);
        return { label: m.label, value: c.total, color: m.color };
      }),
    [stats?.byCategory]
  );

  const paymentItems = useMemo(
    () =>
      (stats?.byPayment ?? [])
        .filter((p) => p.paymentType !== "nao_comprado")
        .map((p) => ({
          label: paymentLabel(p.paymentType),
          value: p.total,
          color: paymentColor(p.paymentType, colors.primary),
        })),
    [stats?.byPayment, colors.primary]
  );

  const { evolutionMonths, evolutionSeries, evolutionAverage } = useMemo(() => {
    const rawMonths = stats?.evolution.months ?? [];
    const rawSeries = stats?.evolution.series ?? [];

    const activeIndices = rawMonths
      .map((_, i) => i)
      .filter((i) => rawSeries.some((s) => s.data[i] > 0));

    const months = activeIndices.map((i) => rawMonths[i]);
    const series = rawSeries.map((s, i) => ({
      userName: s.userName || "Sem nome",
      color: USER_SERIES_COLORS[i % USER_SERIES_COLORS.length],
      data: activeIndices.map((idx) => s.data[idx]),
    }));

    const monthlyTotals = months.map((_, mi) =>
      series.reduce((sum, s) => sum + s.data[mi], 0)
    );
    const average =
      monthlyTotals.length > 0
        ? monthlyTotals.reduce((acc, v) => acc + v, 0) / monthlyTotals.length
        : 0;

    return { evolutionMonths: months, evolutionSeries: series, evolutionAverage: average };
  }, [stats?.evolution.months, stats?.evolution.series]);

  const handleCategoryPress = useCallback(
    (category: string) => {
      router.push({
        pathname: "/(protected)/dashboard-category",
        params: {
          category,
          month: String(month),
          year: String(year),
          status: statusFilter,
          ...(apiMonthList ? { monthList: apiMonthList } : {}),
          ...(userId !== ALL_USERS ? { userId } : {}),
        },
      } as unknown as Href);
    },
    [router, month, year, statusFilter, apiMonthList, userId]
  );

  const filters = (
    <View style={styles.filtersBlock}>
      <View style={styles.filters}>
        <DashboardSelect
          label="Mês"
          value={String(month)}
          options={monthOptions}
          onChange={(v) => setMonth(Number(v))}
          style={styles.filterItem}
        />
        <DashboardSelect
          label="Ano"
          value={String(year)}
          options={yearOptions}
          onChange={(v) => setYear(Number(v))}
          style={styles.filterItem}
        />
        {inGroup && (
          <DashboardSelect
            label="Usuário"
            value={userId}
            options={userOptions}
            onChange={setUserId}
            style={styles.filterItem}
          />
        )}
      </View>
      <HomeFilters value={statusFilter} onChange={setStatusFilter} />
      <MonthListFilters value={monthListFilter} onChange={setMonthListFilter} />
    </View>
  );

  return (
    <AppShell title="Dashboard" subtitle={dashboardSubtitle} showBack showSettings={false}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !!stats}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {filters}

          {error && !stats ? (
            <ErrorState error={error.message} onRetry={refetch} />
          ) : (
            <>
              <View style={styles.statsGrid}>
                <StatCard
                  label={`Total de ${MONTHS_FULL[month - 1]}`}
                  value={formatBRL(stats?.total ?? 0)}
                  color={meta > 0 && (stats?.total ?? 0) > meta ? colors.danger : colors.success}
                  loading={showSkeleton}
                />
                <StatCard
                  label="Total da lista do mês"
                  value={formatBRL(stats?.monthListTotal ?? 0)}
                  color={colors.info}
                  loading={showSkeleton}
                />
                <StatCard
                  label="Itens registrados"
                  value={String(stats?.itemsCount ?? 0)}
                  loading={showSkeleton}
                />
                <StatCard
                  label="Pendentes"
                  value={String(stats?.pendingCount ?? 0)}
                  color={(stats?.pendingCount ?? 0) > 0 ? colors.warning : undefined}
                  loading={showSkeleton}
                />
              </View>

              <MetaCard
                total={stats?.total ?? 0}
                meta={meta}
                segments={categoryItems}
                onSaveMeta={(v) => updateGoal.mutate(v)}
                saving={updateGoal.isPending}
                title={goal?.scope === "group" ? "Meta mensal do grupo" : "Meta mensal pessoal"}
              />

              <SectionCard title="Gastos por categoria">
                {showSkeleton ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <HorizontalBarChart items={categoryItems} />
                )}
              </SectionCard>

              <SectionCard title="Gastos por forma de pagamento">
                {showSkeleton ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <VerticalBarChart items={paymentItems} />
                )}
              </SectionCard>

              <SectionCard title="Evolução por usuário">
                {showSkeleton ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <EvolutionLineChart
                    months={evolutionMonths}
                    series={evolutionSeries}
                    average={evolutionAverage}
                  />
                )}
              </SectionCard>

              <SectionCard title={`Detalhe por categoria — ${MONTHS_FULL[month - 1]}/${year}`}>
                {showSkeleton ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <CategoryTable
                    rows={stats?.byCategory ?? []}
                    total={stats?.total ?? 0}
                    onCategoryPress={handleCategoryPress}
                  />
                )}
              </SectionCard>
            </>
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
    paddingBottom: 60,
    gap: 18,
  },
  padded: {
    padding: 20,
  },
  filtersBlock: {
    gap: 14,
  },
  filters: {
    flexDirection: "row",
    gap: 10,
  },
  filterItem: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
