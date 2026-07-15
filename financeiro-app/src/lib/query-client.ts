import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos — não rebusca se o dado for recente
      gcTime: 1000 * 60 * 60 * 24, // 24h — mantém em cache p/ persistência (>= maxAge)
      retry: 1,                  // tenta 1 vez em caso de erro
      refetchOnWindowFocus: false, // sem efeito no mobile, mas boa prática explicitar
    },
  },
});
