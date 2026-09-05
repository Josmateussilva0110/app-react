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

interface ChangePasswordDTO {
    current_password?: string
    new_password: string
    confirm_password: string
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
                .select("id, username, email, must_change_password")
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
                    must_change_password: Boolean(data.must_change_password),
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
                .select("id, username, email, must_change_password")
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
                    must_change_password: Boolean(data.must_change_password),
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

    async changePassword(
        userId: string,
        data: ChangePasswordDTO
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const profileResult = await this.getProfile(userId)

            if (!profileResult.status) {
                return profileResult
            }

            const profile = profileResult.data
            const { current_password, new_password } = data

            if (current_password && current_password === new_password) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_PASSWORD,
                        message: "A nova senha deve ser diferente da senha atual.",
                    },
                }
            }

            if (profile.must_change_password) {
                const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                    password: new_password,
                })

                if (error) {
                    console.error("[UserService.changePassword] admin update error:", error)
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.PASSWORD_CHANGE_FAILED,
                            message: "Não foi possível atualizar a senha.",
                        },
                    }
                }

                const { error: flagError } = await supabaseAdmin
                    .from("users")
                    .update({ must_change_password: false })
                    .eq("id", userId)

                if (flagError) {
                    console.error("[UserService.changePassword] flag update error:", flagError)
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.PASSWORD_CHANGE_FAILED,
                            message: "Não foi possível atualizar a senha.",
                        },
                    }
                }

                return this.getProfile(userId)
            }

            if (!current_password) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_PASSWORD,
                        message: "Informe a senha atual.",
                    },
                }
            }

            const { error: authError } = await supabaseAuth.auth.signInWithPassword({
                email: profile.email,
                password: current_password,
            })

            if (authError) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_CREDENTIALS,
                        message: "Senha atual incorreta.",
                    },
                }
            }

            const { error: updateError } = await supabaseAuth.auth.updateUser({
                password: new_password,
            })

            if (updateError) {
                console.error("[UserService.changePassword] updateUser error:", updateError)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.PASSWORD_CHANGE_FAILED,
                        message: "Não foi possível atualizar a senha.",
                    },
                }
            }

            return this.getProfile(userId)
        } catch (error) {
            console.error("[UserService.changePassword] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.PASSWORD_CHANGE_FAILED,
                    message: "Não foi possível atualizar a senha.",
                },
            }
        }
    }

    async requestPasswordReset(identifier: string): Promise<ServiceResult<null, UserErrorCode>> {
        try {
            const normalizedEmail = identifier.trim().toLowerCase()

            const { data: user, error: userError } = await supabaseAdmin
                .from("users")
                .select("id")
                .ilike("email", normalizedEmail)
                .maybeSingle()

            let userId = user?.id

            if (!userId && !userError) {
                const { data: authUser, error: authError } = await supabaseAdmin
                    .schema("auth")
                    .from("users")
                    .select("id")
                    .ilike("email", normalizedEmail)
                    .maybeSingle()

                if (authError) {
                    console.error("[UserService.requestPasswordReset] auth lookup error:", authError)
                }

                userId = authUser?.id
            }

            if (userError) {
                console.error("[UserService.requestPasswordReset] user lookup error:", userError)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED,
                        message: "Não foi possível registrar a solicitação.",
                    },
                }
            }

            if (userId) {
                const { error: insertError } = await supabaseAdmin
                    .from("password_reset_requests")
                    .insert({
                        user_id: userId,
                        identifier: normalizedEmail,
                        status: "pending",
                    })

                if (insertError) {
                    console.error("[UserService.requestPasswordReset] insert error:", insertError)
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED,
                            message: "Não foi possível registrar a solicitação.",
                        },
                    }
                }
            }

            return { status: true, data: null }
        } catch (error) {
            console.error("[UserService.requestPasswordReset] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED,
                    message: "Não foi possível registrar a solicitação.",
                },
            }
        }
    }
}

export default new UserService()
