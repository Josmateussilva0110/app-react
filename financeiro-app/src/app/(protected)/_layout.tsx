
import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!signed) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
