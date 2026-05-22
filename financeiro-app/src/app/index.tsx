import { Redirect } from "expo-router";

import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const {
    signed,
    loading,
  } = useAuth();

  if (loading) {
    return null;
  }

  if (signed) {
    return (
      <Redirect
        href="/(protected)/home"
      />
    );
  }

  return (
    <Redirect href="/welcomePage" />
  );
}
