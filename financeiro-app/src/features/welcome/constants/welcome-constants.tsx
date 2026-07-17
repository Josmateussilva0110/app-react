import { ListChecks, CalendarDays, Sparkles } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

export type WelcomeFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const WELCOME_FEATURES: WelcomeFeature[] = [
  {
    icon: ListChecks,
    title: "Prioridades",
    desc: "Veja o que é alta, média ou baixa.",
  },
  {
    icon: CalendarDays,
    title: "Lista do mês",
    desc: "Acompanhe o que falta pagar.",
  },
  {
    icon: Sparkles,
    title: "Modo pessoal ou em grupo",
    desc: "Use sozinho ou compartilhe com família e amigos.",
  },
];
