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

          left: "5%",
          right: "5%",

          bottom:
            insets.bottom > 0
              ? insets.bottom
              : 16,

          height: 58,

          borderRadius: 20,

          backgroundColor:
            colors.backgroundElement,

          borderTopWidth: 0,

          paddingTop: 4,
          paddingBottom: 4,

          elevation: 0,

          shadowColor: "#000",

          shadowOpacity: 0.12,

          shadowRadius: 12,

          shadowOffset: {
            width: 0,
            height: 6,
          },
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Lista",

          tabBarIcon: ({
            color,
          }) => (
            <ListChecks
              color={color}
              size={18}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="itens"
        options={{
          title: "Itens",

          tabBarIcon: ({
            color,
          }) => (
            <ShoppingBasket
              color={color}
              size={18}
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
          }) => (
            <User
              color={color}
              size={18}
            />
          ),
        }}
      />
    </Tabs>
  );
}
