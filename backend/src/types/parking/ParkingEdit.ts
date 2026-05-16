import OpeningHours from "../../types/hour/hour"

export interface ParkingEditRow {
  parking_id: number
  parking_name: string
  manager_name: string

  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  zip_code: string

  phone: string
  whatsapp: string
  email: string
  open_hours: string

  total_spots: number
  car_spots: number
  moto_spots: number
  truck_spots: number
  pcd_spots: number
  elderly_spots: number
  has_cameras: boolean
  has_washing: boolean
  area_type: number

  price_hour: number
  price_extra_hour: number
  daily_rate: number
  night_period: string
  night_rate: number
  monthly_rate: number
  car_price: number
  moto_price: number
  truck_price: number
}
