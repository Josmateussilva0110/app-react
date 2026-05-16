export interface AllocationDetail {
    allocation_id: string
    client_name: string
    phone: string
    parking_name: string
    plate: string
    brand: string
    vehicle_type: string
    entry_date: string
    observations?: string
    current_duration: number
    price_per_hour: number
    night_price_per_hour: number
    vehicle_fixed_price: number
    payment_type: string
    daily_rate: number
    monthly_rate: number
    night_period?: string
    total: number
}
