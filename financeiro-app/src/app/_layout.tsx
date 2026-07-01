import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ToastProvider } from "@/context/toast.context";
import { AuthProvider } from "@/context/auth.context";
import { ThemeProvider, useTheme } from "@/context/theme.context";
import { ServerWakeOverlay } from "@/components/ui/server-wake-overlay";

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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppNavigator />
            <ServerWakeOverlay />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
