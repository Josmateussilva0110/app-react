import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import { GoalErrorCode } from "../types/code/goalCode"
import { GoalResponse } from "@app/shared"
import { resolveProductScope } from "../utils/productScope"

class GoalService {
    async get(userId: string): Promise<ServiceResult<GoalResponse, GoalErrorCode>> {
        try {
            const scope = await resolveProductScope(userId)

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
        userId: string
    ): Promise<ServiceResult<GoalResponse, GoalErrorCode>> {
        try {
            const scope = await resolveProductScope(userId)
            const now = new Date().toISOString()

            if (scope.mode === "group") {
                const { data: updated, error: updateError } = await supabaseAdmin
                    .from("goals")
                    .update({
                        monthly_goal: monthlyGoal,
                        updated_at: now,
                        updated_by: userId,
                    })
                    .eq("scope", "group")
                    .eq("group_id", scope.groupId)
                    .select("monthly_goal, updated_at")
                    .maybeSingle()

                if (updateError) {
                    console.error("[GoalService.update] Supabase error:", updateError)
                    return {
                        status: false,
                        error: {
                            code: GoalErrorCode.GOAL_UPDATE_FAILED,
                            message: "Não foi possível salvar a meta.",
                        },
                    }
                }

                if (updated) {
                    return {
                        status: true,
                        data: {
                            monthlyGoal: Number(updated.monthly_goal),
                            updatedAt: updated.updated_at,
                            scope: "group",
                        },
                    }
                }

                const { data: created, error: createError } = await supabaseAdmin
                    .from("goals")
                    .insert({
                        scope: "group",
                        group_id: scope.groupId,
                        user_id: null,
                        monthly_goal: monthlyGoal,
                        updated_at: now,
                        updated_by: userId,
                    })
                    .select("monthly_goal, updated_at")
                    .single()

                if (createError || !created) {
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
                        monthlyGoal: Number(created.monthly_goal),
                        updatedAt: created.updated_at,
                        scope: "group",
                    },
                }
            }

            const { data: updatedUser, error: updateUserError } = await supabaseAdmin
                .from("goals")
                .update({
                    monthly_goal: monthlyGoal,
                    updated_at: now,
                    updated_by: userId,
                })
                .eq("scope", "user")
                .eq("user_id", userId)
                .select("monthly_goal, updated_at")
                .maybeSingle()

            if (updateUserError) {
                console.error("[GoalService.update] Supabase error:", updateUserError)
                return {
                    status: false,
                    error: {
                        code: GoalErrorCode.GOAL_UPDATE_FAILED,
                        message: "Não foi possível salvar a meta.",
                    },
                }
            }

            if (updatedUser) {
                return {
                    status: true,
                    data: {
                        monthlyGoal: Number(updatedUser.monthly_goal),
                        updatedAt: updatedUser.updated_at,
                        scope: "user",
                    },
                }
            }

            const { data: createdUser, error: createUserError } = await supabaseAdmin
                .from("goals")
                .insert({
                    scope: "user",
                    user_id: userId,
                    group_id: null,
                    monthly_goal: monthlyGoal,
                    updated_at: now,
                    updated_by: userId,
                })
                .select("monthly_goal, updated_at")
                .single()

            if (createUserError || !createdUser) {
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
                    monthlyGoal: Number(createdUser.monthly_goal),
                    updatedAt: createdUser.updated_at,
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
