import { ParkingErrorCode } from "../code/parkingCode"
import { AllocationErrorCode } from "../code/allocationCode"

export type SpotServiceError = ParkingErrorCode | AllocationErrorCode
