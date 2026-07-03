export type ServerStatus = "idle" | "waking" | "retrying";

export interface ServerStatusSnapshot {
  status: ServerStatus;
  attempt: number;
  maxAttempts: number;
}

type Listener = (snapshot: ServerStatusSnapshot) => void;

class ServerStatusManager {
  private status: ServerStatus = "idle";
  private attempt = 0;
  private maxAttempts = 0;
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
        if (this.pendingRequests > 0) this.emit("waking");
      }, this.WAKE_THRESHOLD_MS);
    }
  };

  onRequestEnd = (): void => {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    this.lastResponseAt = Date.now();

    if (this.pendingRequests === 0) {
      this.clearWakeTimer();
      this.attempt = 0;
      this.maxAttempts = 0;
      this.emit("idle");
    }
  };

  onColdStartRetry = (attempt: number, maxAttempts: number): void => {
    this.attempt = attempt;
    this.maxAttempts = maxAttempts;
    this.clearWakeTimer();
    this.emit("retrying");
  };

  private clearWakeTimer(): void {
    if (this.wakeTimer) {
      clearTimeout(this.wakeTimer);
      this.wakeTimer = null;
    }
  }

  private emit(status: ServerStatus): void {
    this.status = status;
    const snapshot: ServerStatusSnapshot = {
      status,
      attempt: this.attempt,
      maxAttempts: this.maxAttempts,
    };
    this.listeners.forEach((listener) => listener(snapshot));
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    listener({ status: this.status, attempt: this.attempt, maxAttempts: this.maxAttempts });
    return () => this.listeners.delete(listener);
  };

  getStatus = (): ServerStatus => this.status;
}

export const serverStatusManager = new ServerStatusManager();