import { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useTheme } from "@/context/theme.context";

import { useProductStats } from "@/hooks/use-product-stats";
import { useGoal, useUpdateGoal } from "@/hooks/use-goal";
import { HomeFilters } from "@/features/list/components/home-filters";
import type { StatusFilter } from "@/features/list/constants/home.constants";

import { DashboardSelect } from "@/features/dashboard/components/dashboard-select";
import { HorizontalBarChart } from "@/features/dashboard/components/horizontal-bar-chart";
import { VerticalBarChart } from "@/features/dashboard/components/vertical-bar-chart";
import { EvolutionLineChart } from "@/features/dashboard/components/evolution-line-chart";
import { MetaCard } from "@/features/dashboard/components/meta-card";
import { CategoryTable } from "@/features/dashboard/components/category-table";
import {
  categoryMeta,
  paymentLabel,
  paymentColor,
  formatBRL,
  MONTHS_FULL,
  USER_SERIES_COLORS,
} from "@/features/dashboard/constants";

const ALL_USERS = "all";

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: color ?? colors.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [currentYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1); // 1-12
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [userId, setUserId] = useState<string>(ALL_USERS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const {
    data: stats,
    isLoading,
    isFetching,
    isStale,
    error,
    refetch,
  } = useProductStats({
    month,
    year,
    userId: userId === ALL_USERS ? undefined : userId,
    status: statusFilter,
  });

  // Só refetch no focus se os dados estiverem stale — evita tela de loading na 2ª visita.
  useFocusEffect(
    useCallback(() => {
      if (isStale) {
        void refetch();
      }
    }, [isStale, refetch])
  );

  const { data: goal } = useGoal();
  const updateGoal = useUpdateGoal();

  const meta = goal?.monthlyGoal ?? 0;

  const monthOptions = MONTHS_FULL.map((m, i) => ({ value: String(i + 1), label: m }));
  const yearOptions = useMemo(() => {
    return [currentYear - 2, currentYear - 1, currentYear, year]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort((a, b) => b - a)
      .map((v) => ({ value: String(v), label: String(v) }));
  }, [year, currentYear]);

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
          ...(userId !== ALL_USERS ? { userId } : {}),
        },
      } as unknown as Href);
    },
    [router, month, year, statusFilter, userId]
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
        <DashboardSelect
          label="Usuário"
          value={userId}
          options={userOptions}
          onChange={setUserId}
          style={styles.filterItem}
        />
      </View>
      <HomeFilters value={statusFilter} onChange={setStatusFilter} />
    </View>
  );

  if (isLoading && !stats) {
    return (
      <AppShell title="Dashboard" subtitle="Gastos da lista compartilhada" showBack showSettings={false}>
        <LoadingState message="Carregando relatórios…" />
      </AppShell>
    );
  }

  if (error && !stats) {
    return (
      <AppShell title="Dashboard" subtitle="Gastos da lista compartilhada" showBack showSettings={false}>
        <ErrorState error={error.message} onRetry={refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard" subtitle="Gastos da lista compartilhada" showBack showSettings={false}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {filters}

          <View style={styles.statsGrid}>
            <StatCard
              label={`Total de ${MONTHS_FULL[month - 1]}`}
              value={formatBRL(stats?.total ?? 0)}
              color={meta > 0 && (stats?.total ?? 0) > meta ? colors.danger : colors.success}
            />
            <StatCard
              label="Total da lista do mês"
              value={formatBRL(stats?.monthListTotal ?? 0)}
              color={colors.info}
            />
            <StatCard label="Itens registrados" value={String(stats?.itemsCount ?? 0)} />
            <StatCard
              label="Pendentes"
              value={String(stats?.pendingCount ?? 0)}
              color={(stats?.pendingCount ?? 0) > 0 ? colors.warning : undefined}
            />
          </View>

          <MetaCard
            total={stats?.total ?? 0}
            meta={meta}
            segments={categoryItems}
            onSaveMeta={(v) => updateGoal.mutate(v)}
            saving={updateGoal.isPending}
          />

          <SectionCard title="Gastos por categoria">
            <HorizontalBarChart items={categoryItems} />
          </SectionCard>

          <SectionCard title="Gastos por forma de pagamento">
            <VerticalBarChart items={paymentItems} />
          </SectionCard>

          <SectionCard title="Evolução por usuário">
            <EvolutionLineChart
              months={evolutionMonths}
              series={evolutionSeries}
              average={evolutionAverage}
            />
          </SectionCard>

          <View style={styles.sectionSpace}>
            <Text style={[styles.detailTitle, { color: colors.text }]}>
              Detalhe por categoria — {MONTHS_FULL[month - 1]}/{year}
            </Text>
            <CategoryTable
              rows={stats?.byCategory ?? []}
              total={stats?.total ?? 0}
              onCategoryPress={handleCategoryPress}
            />
          </View>
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
  statCard: {
    flexGrow: 1,
    flexBasis: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  sectionSpace: {
    gap: 12,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
});
