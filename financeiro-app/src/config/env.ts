import { API_URL as GENERATED_API_URL } from "./api-url.generated";

export const API_URL = GENERATED_API_URL;

export function getApiHostLabel(): string {
  try {
    return new URL(API_URL).host;
  } catch {
    return "API indisponível";
  }
}
