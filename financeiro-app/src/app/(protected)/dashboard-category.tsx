import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { CategoryProductsScreen } from "@/features/dashboard/components/category-products-screen";
import { parseMonthListParam } from "@/features/dashboard/constants/dashboard-filters";
import type { StatusFilter } from "@/features/list/constants/home.constants";
import { useProducts } from "@/hooks/use-products";
import { categoryEnum } from "@app/shared";

const STATUS_VALUES = new Set<StatusFilter>(["todos", "pendente", "finalizado"]);

function paramString(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export default function DashboardCategoryRoute() {
  const params = useLocalSearchParams();

  const categoryRaw = paramString(params.category) ?? "";
  const categoryParsed = categoryEnum.safeParse(categoryRaw);
  const category = categoryParsed.success ? categoryParsed.data : categoryRaw;

  const monthRaw = Number(paramString(params.month));
  const yearRaw = Number(paramString(params.year));
  const month =
    !isNaN(monthRaw) && monthRaw >= 1 && monthRaw <= 12
      ? monthRaw
      : new Date().getMonth() + 1;
  const year =
    !isNaN(yearRaw) && yearRaw >= 2000 && yearRaw <= 2100
      ? yearRaw
      : new Date().getFullYear();

  const statusRaw = paramString(params.status);
  const status: StatusFilter =
    statusRaw && STATUS_VALUES.has(statusRaw as StatusFilter)
      ? (statusRaw as StatusFilter)
      : "todos";

  const userId = paramString(params.userId);
  const monthListRaw = paramString(params.monthList);
  const monthListFilter = parseMonthListParam(monthListRaw);
  const monthList =
    monthListFilter === "sim" ? true : monthListFilter === "nao" ? false : undefined;

  const query = useMemo(
    () => ({
      limit: 100,
      category: category || undefined,
      month,
      year,
      status,
      userId,
      monthList,
    }),
    [category, month, year, status, userId, monthList]
  );

  const { data: products = [], isLoading, error, refetch } = useProducts({
    ...query,
    enabled: !!category,
  });

  return (
    <CategoryProductsScreen
      category={category || "outros"}
      month={month}
      year={year}
      products={products}
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={refetch}
    />
  );
}
