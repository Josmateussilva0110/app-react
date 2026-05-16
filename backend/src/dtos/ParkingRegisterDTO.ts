import OpeningHours from "../types/hour/hour"

export interface ParkingRegisterDTO {
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
    openingHours: OpeningHours
  }

  operations: {
    totalSpots: number
    carSpots: number
    motoSpots?: number
    truckSpots?: number
    pcdSpots?: number
    elderlySpots?: number
    hasCameras: boolean
    hasWashing: boolean
    areaType: string
  }

  prices: {
    priceHour: number
    priceExtraHour: number

    dailyRate?: number
    monthlyRate?: number

    carPrice?: number
    motoPrice?: number
    truckPrice?: number

    nightRate?: number
    nightPeriod?: OpeningHours
  }
}
