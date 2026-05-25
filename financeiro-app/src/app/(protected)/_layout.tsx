import { Redirect, Tabs } from "expo-router";

import {
  ListChecks,
  ShoppingBasket,
  User,
} from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";

import { useTheme } from "@/context/theme.context";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();

  const { colors } = useTheme();

  const insets = useSafeAreaInsets();

  if (loading) {
    return null;
  }

  if (!signed) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor:
            colors.background,
        },

        tabBarActiveTintColor:
          colors.primary,

        tabBarInactiveTintColor:
          colors.textSecondary,

        tabBarStyle: {
          position: "absolute",

          left: 16,
          right: 16,

          bottom:
            insets.bottom > 0
              ? insets.bottom
              : 16,

          height: 70,

          borderRadius: 24,

          backgroundColor:
            colors.backgroundElement,

          borderTopWidth: 0,

          paddingTop: 8,
          paddingBottom: 8,

          elevation: 0,

          shadowColor: "#000",

          shadowOpacity: 0.15,

          shadowRadius: 16,

          shadowOffset: {
            width: 0,
            height: 8,
          },
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Lista do Mês",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <ListChecks
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="itens"
        options={{
          title: "Cadastrados",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <ShoppingBasket
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <User
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
