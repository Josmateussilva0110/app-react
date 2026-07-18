import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import { GoalErrorCode } from "../types/code/goalCode"
import { GoalResponse } from "@app/shared"
import type { ProductScope } from "../utils/productScope"

class GoalService {
    async get(userId: string, scope: ProductScope): Promise<ServiceResult<GoalResponse, GoalErrorCode>> {
        try {
            if (scope.mode === "group") {
                const { data, error } = await supabaseAdmin
                    .from("goals")
                    .select("monthly_goal, updated_at")
                    .eq("scope", "group")
                    .eq("group_id", scope.groupId)
                    .maybeSingle()

                if (error) {
                    console.error("[GoalService.get] Supabase error:", error)
                    return {
                        status: false,
                        error: {
                            code: GoalErrorCode.GOAL_FETCH_FAILED,
                            message: "Não foi possível buscar a meta.",
                        },
                    }
                }

                return {
                    status: true,
                    data: {
                        monthlyGoal: Number(data?.monthly_goal ?? 0),
                        updatedAt: data?.updated_at ?? null,
                        scope: "group",
                    },
                }
            }

            const { data, error } = await supabaseAdmin
                .from("goals")
                .select("monthly_goal, updated_at")
                .eq("scope", "user")
                .eq("user_id", userId)
                .maybeSingle()

            if (error) {
                console.error("[GoalService.get] Supabase error:", error)
                return {
                    status: false,
                    error: {
                        code: GoalErrorCode.GOAL_FETCH_FAILED,
                        message: "Não foi possível buscar a meta.",
                    },
                }
            }

            if (!data) {
                const { data: created, error: createError } = await supabaseAdmin
                    .from("goals")
                    .insert({ scope: "user", user_id: userId, monthly_goal: 0, updated_by: userId })
                    .select("monthly_goal, updated_at")
                    .single()

                if (createError || !created) {
                    return {
                        status: false,
                        error: {
                            code: GoalErrorCode.GOAL_FETCH_FAILED,
                            message: "Não foi possível buscar a meta.",
                        },
                    }
                }

                return {
                    status: true,
                    data: {
                        monthlyGoal: Number(created.monthly_goal),
                        updatedAt: created.updated_at,
                        scope: "user",
                    },
                }
            }

            return {
                status: true,
                data: {
                    monthlyGoal: Number(data.monthly_goal),
                    updatedAt: data.updated_at,
                    scope: "user",
                },
            }
        } catch (error) {
            console.error("[GoalService.get] error:", error)
            return {
                status: false,
                error: {
                    code: GoalErrorCode.GOAL_FETCH_FAILED,
                    message: "Não foi possível buscar a meta.",
                },
            }
        }
    }

    async update(
        monthlyGoal: number,
        userId: string,
        scope: ProductScope
    ): Promise<ServiceResult<GoalResponse, GoalErrorCode>> {
        try {
            const now = new Date().toISOString()

            if (scope.mode === "group") {
                const { data, error } = await supabaseAdmin
                    .from("goals")
                    .upsert(
                        {
                            scope: "group",
                            group_id: scope.groupId,
                            user_id: null,
                            monthly_goal: monthlyGoal,
                            updated_at: now,
                            updated_by: userId,
                        },
                        { onConflict: "group_id" }
                    )
                    .select("monthly_goal, updated_at")
                    .single()

                if (error || !data) {
                    console.error("[GoalService.update] Supabase error:", error)
                    return {
                        status: false,
                        error: {
                            code: GoalErrorCode.GOAL_UPDATE_FAILED,
                            message: "Não foi possível salvar a meta.",
                        },
                    }
                }

                return {
                    status: true,
                    data: {
                        monthlyGoal: Number(data.monthly_goal),
                        updatedAt: data.updated_at,
                        scope: "group",
                    },
                }
            }

            const { data, error } = await supabaseAdmin
                .from("goals")
                .upsert(
                    {
                        scope: "user",
                        user_id: userId,
                        group_id: null,
                        monthly_goal: monthlyGoal,
                        updated_at: now,
                        updated_by: userId,
                    },
                    { onConflict: "user_id" }
                )
                .select("monthly_goal, updated_at")
                .single()

            if (error || !data) {
                console.error("[GoalService.update] Supabase error:", error)
                return {
                    status: false,
                    error: {
                        code: GoalErrorCode.GOAL_UPDATE_FAILED,
                        message: "Não foi possível salvar a meta.",
                    },
                }
            }

            return {
                status: true,
                data: {
                    monthlyGoal: Number(data.monthly_goal),
                    updatedAt: data.updated_at,
                    scope: "user",
                },
            }
        } catch (error) {
            console.error("[GoalService.update] error:", error)
            return {
                status: false,
                error: {
                    code: GoalErrorCode.GOAL_UPDATE_FAILED,
                    message: "Não foi possível salvar a meta.",
                },
            }
        }
    }
}

export default new GoalService()
