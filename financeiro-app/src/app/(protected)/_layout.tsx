
import { Stack, Redirect } from "expo-router";

export default function ProtectedLayout() {
  const isAuthenticated = true;

  if (!isAuthenticated) {
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
