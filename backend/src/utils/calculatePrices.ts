import { calculateDailyStayValue } from "./calculateDailyCost"
import { calculateHourlyStayValue } from "./calculateHourCost"
import { calculateMonthlyStayValue } from "./calculateMonthCost"
import { type AllocationPrinces } from "../types/allocation/allocationData"
import { parseOpeningHours } from "./parseOpeningHours"

export function calculateAllocationValue(allocation: AllocationPrinces): number {
  const entryAt = new Date(allocation.entry_date)
  const exitAt = new Date()

  const nightPeriod = parseOpeningHours(allocation.night_period ?? null)

  switch (allocation.payment_type) {
    case "day":
      return calculateDailyStayValue({
        entryAt,
        exitAt,
        dailyRate: allocation.daily_rate,
        vehicleFixedPrice: allocation.vehicle_fixed_price,
      })

    case "hour":
      return calculateHourlyStayValue({
        entryAt,
        exitAt,
        pricePerHour: allocation.price_per_hour,
        nightPricePerHour: allocation.night_price_per_hour,
        vehicleFixedPrice: allocation.vehicle_fixed_price,
        nightPeriod,
      })

    case "month":
      return calculateMonthlyStayValue({
        entryAt,
        exitAt,
        monthlyRate: allocation.monthly_rate,
        vehicleFixedPrice: allocation.vehicle_fixed_price,
      })

    default:
      throw new Error(`Invalid payment_type: ${allocation.payment_type}`)
  }
}
