import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/theme.context";

import { CustomTabBar } from "@/components/navigation/custom-tab-bar";

export default function ProtectedLayout() {
  const { signed, loading } =
    useAuth();

  const { colors } =
    useTheme();

  if (loading) return null;

  if (!signed) {
    return (
      <Redirect href="/login" />
    );
  }

  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar {...props} />
      )}
      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor:
            colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="month-list"
      />

      <Tabs.Screen
        name="create-product"
      />

      <Tabs.Screen
        name="itens"
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="product-detail/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="edit-product/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}