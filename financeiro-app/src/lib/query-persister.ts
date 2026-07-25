import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { queryClient } from "@/lib/query-client";

const CACHE_KEY = "FINANCEIRO_QUERY_CACHE";

/**
 * Persiste o cache do React Query no AsyncStorage.
 * Permite exibir os últimos dados (produtos, perfil) instantaneamente
 * na abertura do app, enquanto o servidor acorda e revalida em background
 * (stale-while-revalidate).
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: CACHE_KEY,
  throttleTime: 1000,
});

/** Remove cache persistido — chamar no logout para não vazar dados do usuário anterior. */
export async function clearPersistedQueryCache(): Promise<void> {
  queryClient.clear();
  await AsyncStorage.removeItem(CACHE_KEY);
}
