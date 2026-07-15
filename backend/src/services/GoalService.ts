import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import { GoalErrorCode } from "../types/code/goalCode"
import { GoalResponse } from "@app/shared"

/** Meta é global (lista compartilhada): usamos uma linha única. */
const SETTINGS_ID = "global"

class GoalService {
    async get(): Promise<ServiceResult<GoalResponse, GoalErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin
                .from("app_settings")
                .select("monthly_goal, updated_at")
                .eq("id", SETTINGS_ID)
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
            const { data, error } = await supabaseAdmin
                .from("app_settings")
                .upsert(
                    {
                        id: SETTINGS_ID,
                        monthly_goal: monthlyGoal,
                        updated_at: new Date().toISOString(),
                        updated_by: userId,
                    },
                    { onConflict: "id" }
                )
                .select("monthly_goal, updated_at")
                .single()

            if (error) {
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
