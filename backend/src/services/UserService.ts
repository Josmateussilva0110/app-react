import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import { supabaseAuth } from "../database/supabase/supabase"
import { AuthTokens } from "../types/auth/auth.types"
import { createClient } from "@supabase/supabase-js"
import { env } from "../config/env"
import { UserProfile } from "../types/users/profile"

interface RegisterDTO {
    username: string
    email: string
    password: string
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
                        error: { code: UserErrorCode.EMAIL_ALREADY_EXISTS, message: "E-mail já cadastrado" },
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

            if (error || !data.session) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_CREDENTIALS,
                        message: "Email ou senha incorreto",
                    },
                }
            }

            return {
                status: true,
                data: {
                    accessToken: data.session.access_token,
                    refreshToken: data.session.refresh_token,
                    expiresAt: data.session.expires_at! * 1000, // Supabase retorna em segundos → ms
                    user: {
                        id: data.user.id,
                        email: data.user.email,
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
            const userClient = createClient(
                env.SUPABASE_URL,
                env.SUPABASE_ANON_KEY,
                { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
            )

            const { error } = await userClient.auth.signOut()

            if (error) {
                return {
                    status: false,
                    error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
                }
            }

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

            if (error || !data.session) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_CREDENTIALS,
                        message: "Sessão expirada. Faça login novamente.",
                    },
                }
            }

            return {
                status: true,
                data: {
                    accessToken: data.session.access_token,
                    refreshToken: data.session.refresh_token,
                    expiresAt: data.session.expires_at! * 1000, // Supabase retorna em segundos → ms
                    user: {
                        id: data.user!.id,
                        email: data.user!.email,
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
            const { data, error } = await supabaseAuth
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
            const { data, error } = await supabaseAuth
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
