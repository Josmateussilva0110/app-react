import { VehicleErrorCode } from "../types/code/vehicleCode"

export const vehicleErrorHttpStatusMap: Record<VehicleErrorCode, number> = {
  [VehicleErrorCode.VEHICLE_NOT_FOUND]: 404,
  [VehicleErrorCode.PLATE_ALREADY_EXISTS]: 409,
  [VehicleErrorCode.VEHICLE_CREATE_FAILED]: 500,   
  [VehicleErrorCode.VEHICLE_FETCH_FAILED]: 500,  
  [VehicleErrorCode.VEHICLE_DELETE_FAILED]: 500,
  [VehicleErrorCode.VEHICLE_UPDATE_FAILED]: 500,
}
