import { Stack } from "expo-router";

import { ToastProvider } from "@/context/toast.context";
import { AuthProvider } from "@/context/auth.context";
import { ThemeProvider, useTheme } from "@/context/theme.context";

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
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
