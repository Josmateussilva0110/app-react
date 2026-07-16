export type MonthListFilter = "todos" | "sim" | "nao";

export function toApiMonthList(value: MonthListFilter): "true" | "false" | undefined {
  if (value === "sim") return "true";
  if (value === "nao") return "false";
  return undefined;
}

export function parseMonthListParam(value: string | undefined): MonthListFilter {
  if (value === "true") return "sim";
  if (value === "false") return "nao";
  return "todos";
}
