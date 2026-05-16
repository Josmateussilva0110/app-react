type MonthlyPricingParams = {
  entryAt: Date
  exitAt: Date

  monthlyRate: number
  vehicleFixedPrice: number
}


export function calculateMonthlyStayValue({
  entryAt,
  exitAt,
  monthlyRate,
  vehicleFixedPrice,
}: MonthlyPricingParams): number {
  if (exitAt <= entryAt) {
    throw new Error("exitAt must be greater than entryAt")
  }

  const start = new Date(entryAt.getFullYear(), entryAt.getMonth(), 1)
  const end = new Date(exitAt.getFullYear(), exitAt.getMonth(), 1)

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1

  const totalValue = vehicleFixedPrice + months * monthlyRate

  return Number(totalValue.toFixed(2))
}
