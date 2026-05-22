import { Stack } from "expo-router";
import { ToastProvider } from "@/context/toast.context";
import { AuthProvider } from "@/context/auth.context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,

            // evita o flash branco
            contentStyle: {
              backgroundColor: "#0f0f0f",
            },

            // animação suave
            animation: "ios_from_right",

            // duração/transição mais fluida
            animationDuration: 250,
          }}
        />
      </ToastProvider>
    </AuthProvider>
  );
}