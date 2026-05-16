import OpeningHours from "../types/hour/hour"

type HourlyPricingParams = {
  entryAt: Date
  exitAt: Date

  pricePerHour: number       // P_h
  nightPricePerHour: number  // P_n
  vehicleFixedPrice: number  // P_v

  nightPeriod?: OpeningHours | null
}

export function calculateHourlyStayValue({
  entryAt,
  exitAt,
  pricePerHour,
  nightPricePerHour,
  vehicleFixedPrice,
  nightPeriod,
}: HourlyPricingParams): number {

  if (exitAt <= entryAt) {
    throw new Error("exitAt must be greater than entryAt")
  }

  const MS_PER_HOUR = 1000 * 60 * 60

  const totalHours =
    (exitAt.getTime() - entryAt.getTime()) / MS_PER_HOUR

  
  if (!nightPeriod) {
    const totalValue =
      vehicleFixedPrice + totalHours * pricePerHour

    return Number(totalValue.toFixed(2))
  }


  const days: Date[] = []
  const current = new Date(entryAt)
  current.setHours(0, 0, 0, 0)

  const endDay = new Date(exitAt)
  endDay.setHours(0, 0, 0, 0)

  while (current <= endDay) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  if (nightPeriod.start == null || nightPeriod.end == null) {
    throw new Error("nightPeriod.start and nightPeriod.end must be defined")
  }

  const [nightStartHour, nightStartMinute] =
    nightPeriod.start.split(":").map(Number)

  const [nightEndHour, nightEndMinute] =
    nightPeriod.end.split(":").map(Number)

  const crossesMidnight =
    nightEndHour < nightStartHour ||
    (nightEndHour === nightStartHour &&
      nightEndMinute < nightStartMinute)

  let nightHours = 0

  for (const day of days) {
    const nightStart = new Date(day)
    nightStart.setHours(nightStartHour, nightStartMinute, 0, 0)

    const nightEnd = new Date(day)

    if (crossesMidnight) {
      nightEnd.setDate(nightEnd.getDate() + 1)
    }

    nightEnd.setHours(nightEndHour, nightEndMinute, 0, 0)

    const start = Math.max(
      entryAt.getTime(),
      nightStart.getTime()
    )

    const end = Math.min(
      exitAt.getTime(),
      nightEnd.getTime()
    )

    if (end > start) {
      nightHours += (end - start) / MS_PER_HOUR
    }
  }

  const normalHours = totalHours - nightHours

  const totalValue =
    vehicleFixedPrice +
    normalHours * pricePerHour +
    nightHours * nightPricePerHour

  return Number(totalValue.toFixed(2))
}
