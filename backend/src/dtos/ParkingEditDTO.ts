
export interface ParkingEditDTO {
  id: number
  parkingName: string
  managerName: string
  address: {
    street: string
    number: string
    district: string
    city: string
    state: string
    zipCode: string
    complement?: string
  }
  contacts: {
    phone: string
    whatsapp: string
    email: string
    openingHours: { start: string, end: string } | null
  }

  operations: {
    totalSpots: number
    carSpots: number
    motoSpots: number
    truckSpots: number
    pcdSpots: number
    elderlySpots: number
    hasCameras: boolean
    hasWashing: boolean
    areaType: number
  }
  prices: {
    carPrice: number
    motoPrice: number
    truckPrice: number
    priceHour: number
    priceExtraHour: number
    dailyRate: number
    monthlyRate: number
    nightRate: number
    nightPeriod: { start: string, end: string } | null
  }
}
