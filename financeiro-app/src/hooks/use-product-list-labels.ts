import { useGroupMode } from "@/features/group/hooks/use-group-mode";

export function useProductListLabels(defaultTitle = "Meus Itens") {
  const { inGroup, groupName } = useGroupMode();

  if (!inGroup) {
    return {
      inGroup: false,
      groupName: null as string | null,
      title: defaultTitle,
      subtitle: "Seus itens pessoais",
    };
  }

  return {
    inGroup: true,
    groupName,
    title: "Itens do grupo",
    subtitle: `Compartilhado · ${groupName}`,
  };
}
