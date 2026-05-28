import { Flame, Clock, Leaf, type LucideIcon} from "lucide-react-native";
import type { Priority } from "@/lib/storage";

export type StatusFilter = "todos" | "pendente" | "finalizado";

export type Group = {
  key: Priority;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

export const PRIORITY_GROUPS: Group[] = [
  {
    key: "alta",
    label: "Alta",
    icon: Flame,
    color: "#ef4444",
    bgColor: "#ef444418",
  },
  {
    key: "media",
    label: "Média",
    icon: Clock,
    color: "#f59e0b",
    bgColor: "#f59e0b18",
  },
  {
    key: "baixa",
    label: "Baixa",
    icon: Leaf,
    color: "#22c55e",
    bgColor: "#22c55e18",
  },
];
