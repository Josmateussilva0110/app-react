import { z } from "zod";

export const statsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  userId: z.string().min(1).optional(),
});

export type StatsQuery = z.infer<typeof statsQuerySchema>;

export type CategoryStat = {
  category: string;
  total: number;
  count: number;
};

export type PaymentStat = {
  paymentType: string;
  total: number;
};

export type EvolutionSeries = {
  userId: string;
  userName: string;
  data: number[];
};

export type DashboardStats = {
  total: number;
  monthListTotal: number;
  itemsCount: number;
  pendingCount: number;
  byCategory: CategoryStat[];
  byPayment: PaymentStat[];
  evolution: {
    /** Números dos meses (1-12) presentes na série. */
    months: number[];
    series: EvolutionSeries[];
  };
  /** Todos os usuários com produtos (para o filtro). */
  users: { id: string; name: string }[];
};
