import { useEffect } from "react";
import { Stack } from "expo-router";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@/lib/query-client";
import { asyncStoragePersister } from "@/lib/query-persister";
import { ToastProvider } from "@/context/toast.context";
import { AuthProvider } from "@/context/auth.context";
import { ThemeProvider, useTheme } from "@/context/theme.context";
import { ServerWakeOverlay } from "@/components/ui/server-wake-overlay";
import { warmupServer } from "@/services/server-warmup";

const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24; // 24h

function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "ios_from_right",
        animationDuration: 250,
      }}
    />
  );
}

export default function RootLayout() {
  useEffect(() => {
    warmupServer();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: PERSIST_MAX_AGE,
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppNavigator />
            <ServerWakeOverlay />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
