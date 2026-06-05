import {
  Dumbbell,
  Gamepad2,
  Gift,
  HeartPulse,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";

export const PRIORITIES = [
  { key: "alta",  label: "Alta",  color: "#ef4444" },
  { key: "media", label: "Média", color: "#f59e0b" },
  { key: "baixa", label: "Baixa", color: "#22c55e" },
] as const;

export const PAYMENT_TYPES = [
  { key: "debito",       label: "Débito" },
  { key: "credito",      label: "Crédito" },
  { key: "pix",          label: "Pix" },
  { key: "dinheiro",     label: "Dinheiro" },
  { key: "nao_comprado", label: "Não comprado" },
] as const;

export const CATEGORIES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "compras",      label: "Compras",      icon: ShoppingCart },
  { key: "alimentacao",  label: "Alimentação",  icon: UtensilsCrossed },
  { key: "lazer",        label: "Lazer",        icon: Gamepad2 },
  { key: "esporte",      label: "Esporte",      icon: Dumbbell },
  { key: "investimento", label: "Investimento", icon: TrendingUp },
  { key: "saude",        label: "Saúde",        icon: HeartPulse },
  { key: "presentes",    label: "Presentes",    icon: Gift },
];