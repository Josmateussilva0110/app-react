export function parseOpeningHours(
  value: string | { start: string; end: string } | null
): { start: string; end: string } | null {
  if (!value) return null

  // já é JSON
  if (typeof value === "object") {
    return value
  }

  // string JSON
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}