export type ServerStatus = "idle" | "waking";
type Listener = (status: ServerStatus) => void;

class ServerStatusManager {
  private status: ServerStatus = "idle";
  private listeners = new Set<Listener>();
  private pendingRequests = 0;
  private wakeTimer: ReturnType<typeof setTimeout> | null = null;
  private lastResponseAt = 0;

  private readonly WAKE_THRESHOLD_MS = 2500;
  private readonly ASSUME_WARM_WINDOW_MS = 10 * 60 * 1000;

  onRequestStart = (): void => {
    this.pendingRequests++;

    const isLikelyWarm =
      this.lastResponseAt > 0 &&
      Date.now() - this.lastResponseAt < this.ASSUME_WARM_WINDOW_MS;

    if (isLikelyWarm) return;

    if (!this.wakeTimer) {
      this.wakeTimer = setTimeout(() => {
        if (this.pendingRequests > 0) this.setStatus("waking");
      }, this.WAKE_THRESHOLD_MS);
    }
  };

  onRequestEnd = (): void => {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    this.lastResponseAt = Date.now();

    if (this.pendingRequests === 0) {
      this.clearWakeTimer();
      this.setStatus("idle");
    }
  };

  private clearWakeTimer(): void {
    if (this.wakeTimer) {
      clearTimeout(this.wakeTimer);
      this.wakeTimer = null;
    }
  }

  private setStatus(status: ServerStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    listener(this.status);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getStatus = (): ServerStatus => {
    return this.status;
  };
}

export const serverStatusManager = new ServerStatusManager();
