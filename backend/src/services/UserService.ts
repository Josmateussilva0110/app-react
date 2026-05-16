import bcrypt from "bcrypt"
import User, { UserData } from "../model/User"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import {supabase } from "../database/supabase/supabase"

interface RegisterDTO {
  username: string
  email: string
  password: string
}

class UserService {
    async register(data: RegisterDTO): Promise<ServiceResult<{ id: number; username: string }, UserErrorCode | "SUPABASE_ERROR">> {
        const { username, email, password } = data

        const passwordHash = await bcrypt.hash(password, 10)

        const { data: user, error } = await supabase
        .from("users")
        .insert({
            username,
            email,
            password: passwordHash,
        })
        .select()
        .single()

        if (error) {
            return {
                status: false,
                error: {
                code: "SUPABASE_ERROR",
                message: error.message,
                },
            }
        }

        return {
            status: true,
            data: {username: user.username, id: user.id},
        }
    }

    async login(email: string, password: string): Promise<ServiceResult<{ id: number; username: string }, UserErrorCode>> {
        try {
            const user = await User.findByEmail(email)
            if (!user) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Email ou senha incorreto",
                    },
                }
            }

            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_PASSWORD,
                        message: "Email ou senha incorreto",
                    },
                }
            }

            return {
                status: true,
                data: {
                    id: user.id!,
                    username: user.username,
                },
            }
        } catch (error) {
            console.error("UserService.login error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.LOGIN_FAILED,
                    message: "Erro ao fazer login",
                },
            }
        }
    }

    async findById(id: string): Promise<ServiceResult<UserData, UserErrorCode>> {
        try {
            const user = await User.findById(id)
            if (!user) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Usuário não encontrado",
                    },
                }
            }

            return {
                status: true,
                data: user
            }
        } catch (error) {
            console.error("UserService.findById error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro interno ao buscar usuário",
                },
            }
        }
    }
}

export default new UserService()
