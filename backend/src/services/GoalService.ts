import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import { GoalErrorCode } from "../types/code/goalCode"
import { GOAL_SELECT_FIELDS } from "../constants/goal-select-fields"
import { GoalResponse } from "@app/shared"
import type { ProductScope } from "../utils/productScope"

type GoalScope = "user" | "group"

type GoalRow = {
    monthly_goal: number | string | null
    updated_at: string | null
}

/** Identifica a linha de meta do escopo atual: como filtrar e como criar. */
type GoalTarget = {
    scope: GoalScope
    column: "user_id" | "group_id"
    value: string
    insertKeys: { scope: GoalScope; user_id: string | null; group_id: string | null }
}

class GoalService {
    private resolveTarget(userId: string, scope: ProductScope): GoalTarget {
        if (scope.mode === "group") {
            return {
                scope: "group",
                column: "group_id",
                value: scope.groupId,
                insertKeys: { scope: "group", user_id: null, group_id: scope.groupId },
            }
        }

        return {
            scope: "user",
            column: "user_id",
            value: userId,
            insertKeys: { scope: "user", user_id: userId, group_id: null },
        }
    }

    private mapGoal(row: GoalRow, scope: GoalScope): GoalResponse {
        return {
            monthlyGoal: Number(row.monthly_goal ?? 0),
            updatedAt: row.updated_at ?? null,
            scope,
        }
    }

    private fetchFailed(): ServiceResult<never, GoalErrorCode> {
        return {
            status: false,
            error: {
                code: GoalErrorCode.GOAL_FETCH_FAILED,
                message: "Não foi possível buscar a meta.",
            },
        }
    }

    private updateFailed(): ServiceResult<never, GoalErrorCode> {
        return {
            status: false,
            error: {
                code: GoalErrorCode.GOAL_UPDATE_FAILED,
                message: "Não foi possível salvar a meta.",
            },
        }
    }

    private forbidden(message: string): ServiceResult<never, GoalErrorCode> {
        return {
            status: false,
            error: { code: GoalErrorCode.GOAL_FORBIDDEN, message },
        }
    }

    private applyGoalFilter<T extends { eq: (column: string, value: unknown) => T }>(
        dbQuery: T,
        target: GoalTarget
    ): T {
        return dbQuery.eq("scope", target.scope).eq(target.column, target.value)
    }

    /**
     * Devolve o erro que impede a alteração da meta do grupo; `null` libera.
     * Falha ao consultar a participação é 500, não 403: o usuário pode ser o dono,
     * e responder "você não está neste grupo" mandaria o app mostrar uma negativa
     * que ninguém consegue resolver.
     */
    private async denyIfNotGroupOwner(
        userId: string,
        groupId: string
    ): Promise<ServiceResult<never, GoalErrorCode> | null> {
        const { data: membership, error } = await supabaseAdmin
            .from("group_members")
            .select("role")
            .eq("group_id", groupId)
            .eq("user_id", userId)
            .maybeSingle()

        if (error) {
            console.error("[GoalService.denyIfNotGroupOwner] Supabase error:", error)
            return this.updateFailed()
        }

        if (!membership) {
            return this.forbidden("Você não está neste grupo.")
        }

        if (membership.role !== "owner") {
            return this.forbidden("Apenas o dono do grupo pode alterar a meta compartilhada.")
        }

        return null
    }

    /** Cria a meta zerada do usuário na primeira leitura. */
    private async createUserGoal(
        target: GoalTarget,
        userId: string
    ): Promise<ServiceResult<GoalResponse, GoalErrorCode>> {
        const { data, error } = await supabaseAdmin
            .from("goals")
            .insert({ ...target.insertKeys, monthly_goal: 0, updated_by: userId })
            .select(GOAL_SELECT_FIELDS)
            .single()

        if (error || !data) {
            console.error("[GoalService.createUserGoal] Supabase error:", error)
            return this.fetchFailed()
        }

        return { status: true, data: this.mapGoal(data, target.scope) }
    }

    async get(userId: string, scope: ProductScope): Promise<ServiceResult<GoalResponse, GoalErrorCode>> {
        try {
            const target = this.resolveTarget(userId, scope)
            const goalQuery = supabaseAdmin.from("goals").select(GOAL_SELECT_FIELDS)
            const { data, error } = await this.applyGoalFilter(goalQuery, target).maybeSingle()

            if (error) {
                console.error("[GoalService.get] Supabase error:", error)
                return this.fetchFailed()
            }

            if (data) {
                return { status: true, data: this.mapGoal(data, target.scope) }
            }

            // Grupo sem meta responde zerado sem criar linha: só o dono cria, pelo update.
            if (target.scope === "group") {
                return {
                    status: true,
                    data: { monthlyGoal: 0, updatedAt: null, scope: "group" },
                }
            }

            return this.createUserGoal(target, userId)
        } catch (error) {
            console.error("[GoalService.get] error:", error)
            return this.fetchFailed()
        }
    }

    async update(
        monthlyGoal: number,
        userId: string,
        scope: ProductScope
    ): Promise<ServiceResult<GoalResponse, GoalErrorCode>> {
        try {
            const target = this.resolveTarget(userId, scope)

            if (scope.mode === "group") {
                const denial = await this.denyIfNotGroupOwner(userId, scope.groupId)
                if (denial) return denial
            }

            const idQuery = supabaseAdmin.from("goals").select("id")
            const { data: existing, error: fetchError } = await this.applyGoalFilter(idQuery, target).maybeSingle()

            if (fetchError) {
                console.error("[GoalService.update] fetch error:", fetchError)
                return this.updateFailed()
            }

            const goalPayload = {
                monthly_goal: monthlyGoal,
                updated_at: new Date().toISOString(),
                updated_by: userId,
            }

            const { data, error } = existing
                ? await supabaseAdmin
                      .from("goals")
                      .update(goalPayload)
                      .eq("id", existing.id)
                      .select(GOAL_SELECT_FIELDS)
                      .single()
                : await supabaseAdmin
                      .from("goals")
                      .insert({ ...target.insertKeys, ...goalPayload })
                      .select(GOAL_SELECT_FIELDS)
                      .single()

            if (error || !data) {
                console.error("[GoalService.update] Supabase error:", error)
                return this.updateFailed()
            }

            return { status: true, data: this.mapGoal(data, target.scope) }
        } catch (error) {
            console.error("[GoalService.update] error:", error)
            return this.updateFailed()
        }
    }
}

export default new GoalService()
