import db from "../database/connection/connection"

export interface Timestamps {
  created_at?: string
  updated_at?: string
}

export default class Model<T extends Record<string, any>> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  protected getTimestamps(): Timestamps {
    const now = new Date().toISOString()
    return { created_at: now, updated_at: now }
  }

  async save(
    data: T,
    options?: {
      withTimestamps?: boolean
      trx?: any
      returningField?: string
    }
  ): Promise<number> {
    const {
      withTimestamps = true,
      trx,
      returningField = "id",
    } = options || {}

    const insertData = withTimestamps
      ? { ...data, ...this.getTimestamps() }
      : data

    const query = trx ?? db

    const result = await query(this.tableName)
      .insert(insertData)
      .returning(returningField)

    return result[0][returningField]
  }


  async findAll(): Promise<(T & Timestamps)[]> {
    return db(this.tableName).select("*")
  }

  async findById(
    id: number | string,
    idField = "id"
  ): Promise<(T & Timestamps) | null> {
    const result = await db(this.tableName).where(idField, id).first()
    return result ?? null

  }

  async update(
    id: number | string,
    data: Partial<T>,
    options?: {
      idField?: string
      withTimestamps?: boolean
      trx?: any
    }
  ): Promise<void> {
    const {
      idField = "id",
      withTimestamps = true,
      trx,
    } = options || {}

    const updateData = withTimestamps
      ? { ...data, updated_at: new Date().toISOString() }
      : data

    const query = trx ?? db

    await query(this.tableName)
      .where(idField, id)
      .update(updateData)
  }

  async delete(
    id: number | string,
    idField = "id",
    trx?: any
  ): Promise<boolean> {
    const query = trx ?? db

    const rowsDeleted = await query(this.tableName)
      .where(idField, id)
      .delete()

    return rowsDeleted > 0
  }
}
