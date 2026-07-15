import type { AxiosRequestConfig } from "axios";
import { api } from "./api";
import { serverStatusManager } from "./server-status.manager";

const WARMUP_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 6;

let warmupInFlight: Promise<void> | null = null;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Acorda o backend (Render free dorme após inatividade).
 * Dispara no boot do app para que o cold start (~30-60s) aconteça
 * em paralelo com o login/navegação, e não na tela de produtos.
 *
 * Usa timeout longo (o padrão de 10s não cobre o cold start) e
 * reaproveita a mesma chamada se já houver um warmup em andamento.
 */
export function warmupServer(): Promise<void> {
  if (warmupInFlight) return warmupInFlight;

  warmupInFlight = (async () => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        await api.get("/health", {
          _skipAuth: true,
          timeout: WARMUP_TIMEOUT_MS,
        } as AxiosRequestConfig);
        return;
      } catch {
        if (attempt >= MAX_ATTEMPTS) return;
        serverStatusManager.onColdStartRetry(attempt, MAX_ATTEMPTS);
        await delay(Math.min(1000 * 2 ** attempt, 5000));
      }
    }
  })().finally(() => {
    warmupInFlight = null;
  });

  return warmupInFlight;
}
