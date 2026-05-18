import bcrypt from "bcrypt"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import { supabase } from "../database/supabase/supabase"
import { AuthTokens } from "../types/auth/auth.types"

interface RegisterDTO {
    username: string
    email: string
    password: string
}

class UserService {
    async register(data: RegisterDTO): Promise<ServiceResult<{ username: string }, UserErrorCode>> {
        const { username, email, password } = data
        const passwordHash = await bcrypt.hash(password, 10)

        const { data: user, error } = await supabase
            .from("users")
            .insert({ username, email, password: passwordHash })
            .select()
            .single()

        if (error) {
            console.error("[UserService.register] Supabase error:", error)

            if (error.code === "23505") {
                return {
                    status: false,
                    error: { code: UserErrorCode.EMAIL_ALREADY_EXISTS, message: "E-mail já cadastrado" },
                }
            }

            return {
                status: false,
                error: { code: UserErrorCode.USER_CREATE_FAILED, message: "Não foi possível criar o usuário. Tente novamente." },
            }
        }

        return {
            status: true,
            data: { username: user.username },
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
}

export default new UserService()
