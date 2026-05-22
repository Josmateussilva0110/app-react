import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthData } from "@/types/auth.types";

const AUTH_KEY = "@app_auth";

export async function saveAuth(data: AuthData) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export async function getAuth() {
  const data = await AsyncStorage.getItem(AUTH_KEY);

  if (!data) return null;

  return JSON.parse(data) as AuthData;
}

export async function removeAuth() {
  await AsyncStorage.removeItem(AUTH_KEY);
}
