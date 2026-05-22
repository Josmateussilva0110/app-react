import { Redirect, Tabs } from "expo-router";

import {
  House,
  User,
} from "lucide-react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";

import {
  Colors,
  PRIMARY_COLOR,
} from "@/constants/theme";

export default function ProtectedLayout() {
  const {
    signed,
    loading,
  } = useAuth();

  const insets =
    useSafeAreaInsets();

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
            Colors.dark.background,
        },

        tabBarActiveTintColor:
          PRIMARY_COLOR,

        tabBarInactiveTintColor:
          Colors.dark.textSecondary,

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
            "#18181B",

          borderTopWidth: 0,

          paddingTop: 8,
          paddingBottom: 8,

          elevation: 0,

          shadowColor: "#000",

          shadowOpacity: 0.25,

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
          title: "Home",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <House
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