import {
  Home,
  UtensilsCrossed,
  PartyPopper,
  Dumbbell,
  Shirt,
  Smartphone,
  Sparkles,
  TrendingUp,
  HeartPulse,
  Gift,
  Package,
  type LucideIcon,
} from "lucide-react-native";

export type CategoryMeta = {
  label: string;
  color: string;
  icon: LucideIcon;
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  casa: { label: "Casa", color: "#22C55E", icon: Home },
  alimentacao: { label: "Alimentação", color: "#F59E0B", icon: UtensilsCrossed },
  lazer: { label: "Lazer", color: "#A855F7", icon: PartyPopper },
  esporte: { label: "Esporte", color: "#06B6D4", icon: Dumbbell },
  vestuario: { label: "Vestuário", color: "#EC4899", icon: Shirt },
  eletronicos: { label: "Eletrônicos", color: "#3B82F6", icon: Smartphone },
  cuidados_pessoais: { label: "Cuidados pessoais", color: "#14B8A6", icon: Sparkles },
  investimento: { label: "Investimento", color: "#84CC16", icon: TrendingUp },
  saude: { label: "Saúde", color: "#EF4444", icon: HeartPulse },
  presentes: { label: "Presentes", color: "#F97316", icon: Gift },
};

export const FALLBACK_CATEGORY: CategoryMeta = {
  label: "Outros",
  color: "#71717A",
  icon: Package,
};

export function categoryMeta(key: string): CategoryMeta {
  return CATEGORY_META[key] ?? { ...FALLBACK_CATEGORY, label: key || "Outros" };
}

export const PAYMENT_LABELS: Record<string, string> = {
  debito: "Débito",
  credito: "Crédito",
  pix: "Pix",
  dinheiro: "Dinheiro",
  nao_comprado: "Não comprado",
};

export const PAYMENT_COLORS: Record<string, string> = {
  credito: "#3B82F6",
  pix: "#22C55E",
  debito: "#F59E0B",
  dinheiro: "#A855F7",
};

export function paymentLabel(key: string): string {
  return PAYMENT_LABELS[key] ?? key ?? "Outros";
}

export function paymentColor(key: string, fallback = "#71717A"): string {
  return PAYMENT_COLORS[key] ?? fallback;
}

export const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const MONTHS_ABBR = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/** Cores para as séries de usuários no gráfico de evolução. */
export const USER_SERIES_COLORS = [
  "#22C55E",
  "#3B82F6",
  "#F59E0B",
  "#A855F7",
  "#EC4899",
  "#06B6D4",
];

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
