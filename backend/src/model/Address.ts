import Model from "./Model"
//import db from "../database/connection/connection"

export interface AddressData {
  id?: number
  parking_id: number
  street: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
  zip_code: string
  created_at?: string 
  updated_at?: string
}

class ParkingAddress extends Model<AddressData> {
  constructor() {
    super("parking_address")
  }


}

export default new ParkingAddress()
