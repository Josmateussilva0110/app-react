import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import { supabaseAuth, supabaseAdmin } from "../database/supabase/supabase"
import { AuthTokens } from "../types/auth/auth.types"
import jwt from "jsonwebtoken"
import { UserProfile } from "../types/users/profile"
import { env } from "../config/env"
import { revokeAccessToken, revokeUserSessions } from "../utils/tokenRevocation"

interface RegisterDTO {
    username: string
    email: string
    password: string
}

function isRefreshTokenReuseOrRevoked(error: { message?: string; code?: string } | null): boolean {
    if (!error) return false

    const message = (error.message ?? "").toLowerCase()
    const code = (error.code ?? "").toLowerCase()

    return (
        code.includes("refresh_token") ||
        message.includes("already used") ||
        message.includes("not found") ||
        message.includes("invalid refresh")
    )
}

class UserService {
    async register(data: RegisterDTO): Promise<ServiceResult<{ username: string }, UserErrorCode>> {
        try {
            const { username, email, password } = data

            const { error } = await supabaseAuth.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                },
            })

            if (error) {
                console.error("[UserService.register] Supabase Auth error:", error)

                if (error.code === "user_already_exists" || error.status === 422) {
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.EMAIL_ALREADY_EXISTS,
                            message: "Não foi possível criar a conta. Verifique os dados ou tente outro e-mail.",
                        },
                    }
                }

                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_CREATE_FAILED,
                        message: "Não foi possível criar o usuário. Tente novamente.",
                    },
                }
            }

            return {
                status: true,
                data: { username },
            }
        } catch (error) {
            console.error("[UserService.register] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_CREATE_FAILED,
                    message: "Não foi possível criar o usuário. Tente novamente.",
                },
            }
        }
    }

    async login(email: string, password: string): Promise<ServiceResult<AuthTokens, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAuth.auth.signInWithPassword({
                email,
                password,
            })

            if (error || !data.session || !data.user) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_CREDENTIALS,
                        message: "Email ou senha incorreto",
                    },
                }
            }

            const expiresAtSec = data.session.expires_at ?? 0

            return {
                status: true,
                data: {
                    accessToken: data.session.access_token,
                    refreshToken: data.session.refresh_token,
                    expiresAt: expiresAtSec * 1000,
                    user: {
                        id: data.user.id,
                        email: data.user.email ?? "",
                    },
                },
            }
        } catch (error) {
            console.error("[UserService.login] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.LOGIN_FAILED,
                    message: "Erro ao fazer login",
                },
            }
        }
    }


    async logout(accessToken: string): Promise<ServiceResult<null, UserErrorCode>> {
        try {
            let userId: string | undefined

            try {
                const payload = jwt.verify(accessToken, env.SUPABASE_JWT_SECRET, {
                    algorithms: ["HS256"],
                }) as { sub?: string }
                userId = payload.sub
            } catch {
                const payload = jwt.decode(accessToken) as { sub?: string } | null
                userId = payload?.sub
            }

            if (!userId) {
                return {
                    status: false,
                    error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
                }
            }

            const { error } = await supabaseAdmin.auth.admin.signOut(userId, "global")

            if (error) {
                return {
                    status: false,
                    error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
                }
            }

            revokeAccessToken(accessToken)
            revokeUserSessions(userId)

            return { status: true, data: null }
        } catch (error) {
            console.error("[UserService.logout] error:", error)
            return {
                status: false,
                error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
            }
        }
    }

    async refresh(refreshToken: string): Promise<ServiceResult<AuthTokens, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAuth.auth.refreshSession({
                refresh_token: refreshToken,
            })

            if (error || !data.session || !data.user) {
                const revoked = isRefreshTokenReuseOrRevoked(error)

                return {
                    status: false,
                    error: {
                        code: revoked ? UserErrorCode.SESSION_REVOKED : UserErrorCode.INVALID_CREDENTIALS,
                        message: revoked
                            ? "Sessão encerrada por segurança. Faça login novamente."
                            : "Sessão expirada. Faça login novamente.",
                    },
                }
            }

            const expiresAtSec = data.session.expires_at ?? 0

            // Supabase rotaciona refresh tokens: sempre persistir o par novo no cliente.
            return {
                status: true,
                data: {
                    accessToken: data.session.access_token,
                    refreshToken: data.session.refresh_token,
                    expiresAt: expiresAtSec * 1000,
                    user: {
                        id: data.user.id,
                        email: data.user.email ?? "",
                    },
                },
            }
        } catch (error) {
            console.error("[UserService.refresh] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.LOGIN_FAILED,
                    message: "Erro ao renovar sessão.",
                },
            }
        }
    }

    async getProfile(userId: string ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin
                .from("users")
                .select("id, username, email")
                .eq("id", userId)
                .single()

            if (error || !data) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Usuário não encontrado.",
                    },
                }
            }

            return {
                status: true,
                data: {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                },
            }
        } catch (error) {
            console.error("[UserService.getProfile] error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro ao buscar perfil do usuário.",
                },
            }
        }
    }

    async updateProfile(userId: string, updates: { username: string } ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin
                .from("users")
                .update({ username: updates.username })
                .eq("id", userId)
                .select("id, username, email")
                .single()

            if (error || !data) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Não foi possível atualizar o perfil.",
                    },
                }
            }

            return {
                status: true,
                data: {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                },
            }
        } catch (error) {
            console.error("[UserService.updateProfile] error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED,
                    message: "Erro ao atualizar perfil do usuário.",
                },
            }
        }
    }
}

export default new UserService()
