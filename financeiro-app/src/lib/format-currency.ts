/** Formata um valor em Reais sem depender de Intl (Hermes). */
export function formatBRL(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  const [intPart, decPart] = Math.abs(rounded).toFixed(2).split(".");
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = rounded < 0 ? "-" : "";
  return `${sign}R$ ${withDots},${decPart}`;
}

/** Valor inteiro em Reais para rótulos de gráfico (ex.: R$ 2.100). */
export function formatBRLChart(value: number): string {
  const rounded = Math.round(value);
  const withDots = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = rounded < 0 ? "-" : "";
  return `${sign}R$ ${withDots}`;
}
