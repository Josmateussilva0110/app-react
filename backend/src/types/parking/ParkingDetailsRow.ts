export interface ParkingDetailsRow {
  id: number
  parkingName: string
  managerName: string

  address_street: string
  address_number: string
  address_district: string
  address_city: string
  address_state: string

  contact_phone: string
  openingHours: string

  ops_total: number
  ops_car: number
  ops_moto: number
  ops_cameras: boolean
  ops_washing: boolean

  price_hour: number
}
