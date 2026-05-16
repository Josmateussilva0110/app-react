type Primitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint

export type Normalized =
  | Primitive
  | Normalized[]
  | { [key: string]: Normalized }


function camelToSnake(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase()
}


export function normalizeKeys<T>(data: T): Normalized {
  return normalizeInternal(data)
}



function normalizeInternal(data: unknown): Normalized {
  if (Array.isArray(data)) {
    return data.map(normalizeInternal)
  }

  if (data !== null && typeof data === "object") {
    const result: Record<string, Normalized> = {}

    for (const [key, value] of Object.entries(data)) {
      result[camelToSnake(key)] = normalizeInternal(value)
    }

    return result
  }

  return data as Primitive
}
