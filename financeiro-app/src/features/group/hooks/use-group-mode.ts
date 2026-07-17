import { useGroup } from "@/hooks/use-group";
import { GROUP_MODE_LABELS, type GroupMode } from "../constants/group-mode.constants";

export function useGroupMode() {
  const query = useGroup();
  const group = query.data?.group ?? null;
  const mode: GroupMode = group ? "group" : "solo";
  const labels = GROUP_MODE_LABELS[mode];

  return {
    ...query,
    mode,
    inGroup: mode === "group",
    group,
    groupName: group?.name ?? null,
    isOwner: group?.role === "owner",
    memberCount: group?.members.length ?? 0,
    badgeLabel: group?.name ?? labels.badge,
    badgeHint: labels.hint,
    tabLabel: group?.name ?? labels.tab,
  };
}
