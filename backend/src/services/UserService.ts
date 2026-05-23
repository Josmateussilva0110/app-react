import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import { supabase } from "../database/supabase/supabase"
import { AuthTokens } from "../types/auth/auth.types"
import { createClient } from "@supabase/supabase-js"

interface RegisterDTO {
    username: string
    email: string
    password: string
}

class UserService {
    async register(data: RegisterDTO): Promise<ServiceResult<{ username: string }, UserErrorCode>> {
        try {
            const { username, email, password } = data

            const { error } = await supabase.auth.signUp({
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
            const { data, error } = await supabase.auth.signInWithPassword({
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
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_ANON_KEY!,
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
            const { data, error } = await supabase.auth.refreshSession({
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
}

export default new UserService()
