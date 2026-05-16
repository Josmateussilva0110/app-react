import { Stack } from "expo-router";
import { ToastProvider } from "@/context/toast.context";

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ToastProvider>
  );
}

