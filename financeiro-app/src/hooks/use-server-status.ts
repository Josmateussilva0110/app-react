import { useEffect, useState } from "react";
import {
  serverStatusManager,
  ServerStatusSnapshot,
} from "@/services/server-status.manager";

export function useServerStatus(): ServerStatusSnapshot {
  const [snapshot, setSnapshot] = useState<ServerStatusSnapshot>(() => ({
    status: serverStatusManager.getStatus(),
    attempt: 0,
    maxAttempts: 0,
  }));

  useEffect(() => serverStatusManager.subscribe(setSnapshot), []);

  return snapshot;
}