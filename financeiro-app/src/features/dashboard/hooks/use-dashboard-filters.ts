import { useCallback, useMemo, useState } from "react";
import type { StatusFilter } from "@/features/list/constants/home.constants";
import {
  type MonthListFilter,
  toApiMonthList,
} from "@/features/dashboard/constants/dashboard-filters";

export const ALL_USERS = "all";
export const ALL_MONTHS = "all";

type DashboardFilters = {
  month: number | null;
  year: number;
  userId: string;
  status: StatusFilter;
  monthList: MonthListFilter;
};

function createDefaultFilters(): DashboardFilters {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    userId: ALL_USERS,
    status: "todos",
    monthList: "todos",
  };
}

export function useDashboardFilters(availableYears: number[] = []) {
  const [filters, setFilters] = useState(createDefaultFilters);

  const patch = useCallback((partial: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const yearOptions = useMemo(() => {
    const years =
      availableYears.length > 0
        ? availableYears
        : filters.year
          ? [filters.year]
          : [new Date().getFullYear()];

    const unique = Array.from(new Set([...years, filters.year])).sort((a, b) => b - a);
    return unique.map((v) => ({ value: String(v), label: String(v) }));
  }, [availableYears, filters.year]);

  const apiMonthList = toApiMonthList(filters.monthList);

  return {
    month: filters.month,
    year: filters.year,
    userId: filters.userId,
    statusFilter: filters.status,
    monthListFilter: filters.monthList,
    apiUserId: filters.userId === ALL_USERS ? undefined : filters.userId,
    apiMonthList,
    yearOptions,
    setMonth: (month: number | null) => patch({ month }),
    setYear: (year: number) => patch({ year }),
    setUserId: (userId: string) => patch({ userId }),
    setStatusFilter: (status: StatusFilter) => patch({ status }),
    setMonthListFilter: (monthList: MonthListFilter) => patch({ monthList }),
  };
}
