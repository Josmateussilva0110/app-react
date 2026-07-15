import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

/**
 * Persiste o cache do React Query no AsyncStorage.
 * Permite exibir os últimos dados (produtos, perfil) instantaneamente
 * na abertura do app, enquanto o servidor acorda e revalida em background
 * (stale-while-revalidate).
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "FINANCEIRO_QUERY_CACHE",
  throttleTime: 1000,
});
