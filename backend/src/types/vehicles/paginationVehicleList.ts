import { VehicleListDTO } from "../../dtos/VehicleListDTO" 

export interface PaginatedVehicleListResult {
  rows: VehicleListDTO[]
  total: number
}
