import { Redirect, Stack, useSegments } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/use-profile";
import { useTheme } from "@/context/theme.context";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const segments = useSegments();
  const { colors } = useTheme();

  const onChangePasswordScreen = segments.includes("change-password-required");

  if (loading || (signed && profileLoading && !profile)) return null;
  if (!signed) return <Redirect href="/login" />;

  if (profile?.must_change_password) {
    if (!onChangePasswordScreen) {
      return <Redirect href="/(protected)/change-password-required" />;
    }

    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="change-password-required"
          options={{ headerShown: false }}
        />
      </Stack>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* As tabs ficam num único "slot" do Stack */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Screens que empilham por cima das tabs */}
      <Stack.Screen name="change-password-required" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard-category" options={{ headerShown: false }} />
      <Stack.Screen name="product-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="edit-product/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="group/index" options={{ headerShown: false }} />
      <Stack.Screen name="group/create" options={{ headerShown: false }} />
      <Stack.Screen name="group/join" options={{ headerShown: false }} />
    </Stack>
  );
}