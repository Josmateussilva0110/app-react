import { type SpotsRow } from "../types/allocation/spots" 

export interface SpotResponse {
    parking_id?: number
    carSpots: number
    motoSpots: number
    truckSpots: number
    pcdSpots: number
    elderlySpots: number
}

export function mapSpotsList(rows: SpotsRow[]): SpotResponse[] {
    return rows.map((row) => ({
        parking_id: Number(row.parking_id),
        carSpots: Number(row.car_spots),
        motoSpots: Number(row.moto_spots),
        truckSpots: Number(row.truck_spots),
        pcdSpots: Number(row.pcd_spots),
        elderlySpots: Number(row.elderly_spots),
    }))
}
