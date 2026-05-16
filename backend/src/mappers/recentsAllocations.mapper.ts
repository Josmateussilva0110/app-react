import { type RecentsAllocations } from "../types/stats/recentsAllocations" 

export interface RecentsAllocationsResponse {
  plate: string
  clientName: string  
  vehicleType: string
  time: number
  date: string
}

export function mapRecentsAllocations(rows: RecentsAllocations[]): RecentsAllocationsResponse[] {
  return rows.map((row) => ({
    plate: row.plate,
    clientName: row.client_name,
    vehicleType: row.vehicle_type,
    time: row.time,
    date: row.date
  }))
}
