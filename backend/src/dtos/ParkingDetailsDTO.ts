export interface ParkingDetailsDTO {
  id: number
  parkingName: string
  managerName: string
  address: {
    street: string
    number: string
    district: string
    city: string
    state: string
  }
  contacts: {
    phone: string
    openingHours: { start: string, end: string } | null
  }
  
  operations: {
    totalSpots: number
    carSpots: number
    motoSpots: number
    hasCameras: boolean
    hasWashing: boolean
  }
  prices: {
    priceHour: number
  }
}
