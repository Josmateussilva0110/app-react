type DailyPricingParams = {
  entryAt: Date
  exitAt: Date

  dailyRate: number
  vehicleFixedPrice: number
}

export function calculateDailyStayValue({
  entryAt,
  exitAt,
  dailyRate,
  vehicleFixedPrice,
}: DailyPricingParams): number {
  if (exitAt <= entryAt) {
    throw new Error("exitAt must be greater than entryAt")
  }

  const startDay = new Date(entryAt)
  startDay.setHours(0, 0, 0, 0)

  const endDay = new Date(exitAt)
  endDay.setHours(0, 0, 0, 0)

  const MS_PER_DAY = 1000 * 60 * 60 * 24

  const days =
    Math.floor((endDay.getTime() - startDay.getTime()) / MS_PER_DAY) + 1

  const totalValue = vehicleFixedPrice + days * dailyRate

  return Number(totalValue.toFixed(2))
}
