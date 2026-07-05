export type Priority = "alta" | "media" | "baixa";

export type Status = "pendente" | "finalizado";


export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
