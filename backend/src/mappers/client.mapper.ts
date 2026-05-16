import { type ClientRow } from "../types/clients/client"

export interface ClientResponse {
  id: number
  username: string
  cpf: string
  phone: string
  email: string
  status?: number
  updatedAt?: string
}

export function mapClientRowList(rows: ClientRow[]): ClientResponse[] {
  return rows.map((row) => ({
    id: row.client_id!,
    username: row.username,
    cpf: row.cpf,
    phone: row.phone,
    email: row.email,
    status: row.status,
    updatedAt: row.updated_at,
  }))
}
