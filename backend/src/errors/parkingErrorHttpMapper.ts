import { ParkingErrorCode } from "../types/code/parkingCode"

export const ParkingErrorHttpStatusMap: Record<ParkingErrorCode , number> = {
  [ParkingErrorCode.PARKING_CREATE_FAILED]: 500, 
  [ParkingErrorCode.PARKING_UPDATE_FAILED]: 500, 
  [ParkingErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ParkingErrorCode.PARKING_NOT_FOUND]: 404,
  [ParkingErrorCode.PARKING_FETCH_FAILED]: 500,
  [ParkingErrorCode.PARKING_REMOVE_FAILED]: 500,
  [ParkingErrorCode.PARKING_INTERNAL_SERVER_ERROR]: 500,
}
