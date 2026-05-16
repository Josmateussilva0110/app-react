import { AllocationErrorCode } from "../types/code/allocationCode" 

export const allocationErrorHttpStatusMap: Record<AllocationErrorCode, number> = {
  [AllocationErrorCode.ALLOCATION_CREATE_FAILED]: 500, 
  [AllocationErrorCode.ALLOCATION_FETCH_FAILED]: 500,
  [AllocationErrorCode.ALLOCATION_NOT_FOUND]: 404,
  [AllocationErrorCode.SPOTS_NOT_FOUND]: 404, 
  [AllocationErrorCode.SPOTS_FETCH_FAILED]: 500,
  [AllocationErrorCode.VEHICLE_ALREADY_EXISTS]: 409,
  [AllocationErrorCode.ALLOCATION_STATS_FAILED]: 500,
  [AllocationErrorCode.ALLOCATION_STATS_NOT_FOUND]: 404,
  [AllocationErrorCode.ALLOCATION_DELETE_FAILED]: 500
}
