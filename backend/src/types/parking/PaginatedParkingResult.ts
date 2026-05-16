import { ParkingDetailsDTO } from "../../dtos/ParkingDetailsDTO"

export interface PaginatedParkingResult {
  rows: ParkingDetailsDTO[]
  total: number
}
