import { ClientListDTO } from "../../dtos/ClientListDTO" 

export interface PaginatedClientListResult {
  rows: ClientListDTO[]
  total: number
}
