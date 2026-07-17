export type GroupMode = "solo" | "group";

export const GROUP_MODE_LABELS = {
  solo: {
    badge: "Pessoal",
    hint: "Modo pessoal",
    tab: "Só você",
  },
  group: {
    badge: "Grupo",
    hint: "Modo grupo",
    tab: "Compartilhado",
  },
} as const;
