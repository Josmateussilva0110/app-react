import * as SecureStore from "expo-secure-store";
import { AuthData } from "@/types/auth.types";

const AUTH_KEY = "app_auth"; 

export async function saveAuth(data: AuthData): Promise<void> {
  await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(data));
}

export async function getAuth(): Promise<AuthData | null> {
  try {
    const data = await SecureStore.getItemAsync(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data) as AuthData;
  } catch {
    await removeAuth();
    return null;
  }
}

export async function removeAuth(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_KEY);
}
