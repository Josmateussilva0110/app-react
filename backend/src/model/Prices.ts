import Model from "./Model"
import OpeningHours from "../types/hour/hour"
//import db from "../database/connection/connection"




export interface ContactData {
  id?: number
  parking_id: number
  price_hour: number
  price_extra_hour: number
  daily_rate?: number
  night_period?: OpeningHours
  night_rate?: number
  monthly_rate?: number
  car_price?: number
  moto_price?: number
  truck_price?: number
  created_at?: string 
  updated_at?: string
}

class ParkingPrices extends Model<ContactData> {
  constructor() {
    super("parking_prices")
  }


}

export default new ParkingPrices()
