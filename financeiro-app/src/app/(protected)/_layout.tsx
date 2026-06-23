import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/theme.context";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) return null;
  if (!signed) return <Redirect href="/login" />;

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
      <Stack.Screen name="product-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="edit-product/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}