import Constants from "expo-constants";
import { API_URL as GENERATED_API_URL } from "./api-url.generated";

const extraApiUrl =
  typeof Constants.expoConfig?.extra?.apiUrl === "string"
    ? Constants.expoConfig.extra.apiUrl
    : "";

function resolveApiUrl(): string {
  if (GENERATED_API_URL) return GENERATED_API_URL;
  if (extraApiUrl) return extraApiUrl;
  return "";
}

export const API_URL = resolveApiUrl();

if (!API_URL) {
  throw new Error(
    "API_URL não configurada. Defina EXPO_PUBLIC_API_URL e rode npm start (gera api-url.generated.ts)."
  );
}

export function getApiHostLabel(): string {
  try {
    return new URL(API_URL).host;
  } catch {
    return "API indisponível";
  }
}
