export interface AllocationPrinces {
    allocation_id: string
    entry_date: string
    price_per_hour: number
    night_price_per_hour: number
    vehicle_fixed_price: number
    payment_type: string
    daily_rate: number
    monthly_rate: number
    night_period?: string
}
