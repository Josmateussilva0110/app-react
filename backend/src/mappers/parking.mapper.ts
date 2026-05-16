import { type ParkingRow } from "../types/parking/parking" 

export interface ParkingResponse {
  id: number
  parkingName: string
  managerName: string
  createdBy?: string
  updatedAt?: string
}

export function mapParkingRowList(rows: ParkingRow[]): ParkingResponse[] {
  return rows.map((row) => ({
    id: row.parking_id!,
    parkingName: row.parking_name,
    managerName: row.manager_name,
    createdBy: row.created_by,
    updatedAt: row.updated_at
  }))
}
