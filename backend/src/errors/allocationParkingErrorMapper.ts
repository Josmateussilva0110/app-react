import { SpotServiceError } from "../types/allocation/SpotsService"
import { ParkingErrorCode } from "../types/code/parkingCode"
import { AllocationErrorCode } from "../types/code/allocationCode"

export const SpotServiceErrorHttpStatusMap: Record<SpotServiceError, number> = {
  // Parking
  [ParkingErrorCode.PARKING_CREATE_FAILED]: 500, 
  [ParkingErrorCode.PARKING_UPDATE_FAILED]: 500, 
  [ParkingErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ParkingErrorCode.PARKING_NOT_FOUND]: 404,
  [ParkingErrorCode.PARKING_FETCH_FAILED]: 500,
  [ParkingErrorCode.PARKING_REMOVE_FAILED]: 500,
  [ParkingErrorCode.PARKING_INTERNAL_SERVER_ERROR]: 500,


  // Allocation
  [AllocationErrorCode.SPOTS_NOT_FOUND]: 404,
  [AllocationErrorCode.SPOTS_FETCH_FAILED]: 500,
  [AllocationErrorCode.ALLOCATION_CREATE_FAILED]: 500,
  [AllocationErrorCode.ALLOCATION_FETCH_FAILED]: 500,
  [AllocationErrorCode.ALLOCATION_NOT_FOUND]: 404,
  [AllocationErrorCode.VEHICLE_ALREADY_EXISTS]: 409,
  [AllocationErrorCode.ALLOCATION_STATS_FAILED]: 500,
  [AllocationErrorCode.ALLOCATION_STATS_NOT_FOUND]: 404,
  [AllocationErrorCode.ALLOCATION_DELETE_FAILED]: 500,
}
