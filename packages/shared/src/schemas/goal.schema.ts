import { z } from "zod";

export const goalSchema = z.object({
  monthlyGoal: z
    .number({ error: "A meta deve ser um número" })
    .nonnegative("A meta não pode ser negativa")
    .max(100000000, "Valor muito alto"),
});

export type GoalDTO = z.infer<typeof goalSchema>;

export type GoalResponse = {
  monthlyGoal: number;
  updatedAt: string | null;
  scope?: "user" | "group";
};
