export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesSearch(target: string, query: string): boolean {
  if (!query) return true;
  return normalizeText(target).includes(normalizeText(query));
}
