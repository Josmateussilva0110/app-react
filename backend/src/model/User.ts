import Model from "./Model"
import db from "../database/connection/connection"

export interface UserData {
  id?: number
  username: string
  email: string
  password: string
  created_at?: string 
  updated_at?: string
}

class User extends Model<UserData> {
  constructor() {
    super("users")
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await db(this.tableName)
        .select("id")
        .where({ email })
        .first()

      return !!result
    } catch (err) {
      console.error(`Erro ao verificar e-mail na tabela ${this.tableName}:`, err)
      return false
    }
  }

  async findByEmail(email: string): Promise<UserData | null> {
    try {
      const normalizedEmail = email.trim().toLowerCase()

      const user = await db(this.tableName)
        .select("*")
        .where({ email: normalizedEmail })
        .first()

      return user ?? null
    } catch (err) {
      console.error(
        `Erro ao buscar usuário por e-mail na tabela ${this.tableName}:`,
        err
      )
      return null
    }
  }


}

export default new User()
