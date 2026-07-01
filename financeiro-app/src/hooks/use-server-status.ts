import { useSyncExternalStore } from "react";
import { serverStatusManager } from "@/services/server-status.manager";

export function useServerStatus() {
  return useSyncExternalStore(
    serverStatusManager.subscribe,
    serverStatusManager.getStatus
  );
}
