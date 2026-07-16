import { useCallback, useMemo, useState } from "react";
import type { StatusFilter } from "@/features/list/constants/home.constants";
import {
  type MonthListFilter,
  toApiMonthList,
} from "@/features/dashboard/constants/dashboard-filters";

export const ALL_USERS = "all";

const CURRENT_YEAR = new Date().getFullYear();

type DashboardFilters = {
  month: number;
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

export function useDashboardFilters() {
  const [filters, setFilters] = useState(createDefaultFilters);

  const patch = useCallback((partial: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const yearOptions = useMemo(
    () =>
      [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, filters.year]
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .sort((a, b) => b - a)
        .map((v) => ({ value: String(v), label: String(v) })),
    [filters.year]
  );

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
    setMonth: (month: number) => patch({ month }),
    setYear: (year: number) => patch({ year }),
    setUserId: (userId: string) => patch({ userId }),
    setStatusFilter: (status: StatusFilter) => patch({ status }),
    setMonthListFilter: (monthList: MonthListFilter) => patch({ monthList }),
  };
}
