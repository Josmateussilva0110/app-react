function mapAreaTypeToNumber(areaType: string): number {
  const map: Record<string, number> = {
    coberta: 1,
    descoberta: 2,
    mista: 3,
  }

  return map[areaType] || 1
}


function mapNumberToAreaType(num: number) {
  const map: Record<number, "coberta" | "descoberta" | "mista"> = {
    1: "coberta",
    2: "descoberta",
    3: "mista",
  }

  return map[num] || "coberta"
}

export { mapAreaTypeToNumber, mapNumberToAreaType}
