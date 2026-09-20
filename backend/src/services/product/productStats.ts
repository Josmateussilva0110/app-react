import { DashboardStats } from "@app/shared"

/**
 * Normaliza o retorno da RPC `get_product_stats`.
 *
 * O jsonb do Postgres chega com números como string em alguns drivers, e um
 * recorte sem linhas devolve chave ausente em vez de zero — daí a conversão
 * campo a campo em vez de confiar no objeto cru.
 */
export function normalizeDashboardStats(data: unknown): DashboardStats {
    const raw = data as DashboardStats
    return {
        total: Number(raw.total) || 0,
        monthListTotal: Number(raw.monthListTotal) || 0,
        pendingTotal: Number(raw.pendingTotal) || 0,
        itemsCount: Number(raw.itemsCount) || 0,
        pendingCount: Number(raw.pendingCount) || 0,
        byCategory: Array.isArray(raw.byCategory) ? raw.byCategory : [],
        byPayment: Array.isArray(raw.byPayment) ? raw.byPayment : [],
        evolution: {
            months: raw.evolution?.months ?? Array.from({ length: 12 }, (_, i) => i + 1),
            series: Array.isArray(raw.evolution?.series)
                ? raw.evolution.series.map((s) => ({
                      userId: String(s.userId),
                      userName: s.userName ?? "",
                      data: Array.isArray(s.data)
                          ? s.data.map((n) => Number(n) || 0)
                          : new Array(12).fill(0),
                  }))
                : [],
        },
        users: Array.isArray(raw.users)
            ? raw.users.map((u) => ({
                  id: String(u.id),
                  name: u.name ?? "",
              }))
            : [],
    }
}
