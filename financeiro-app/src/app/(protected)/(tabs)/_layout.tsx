import { useEffect } from "react";
import { Tabs } from "expo-router";
import { useTheme } from "@/context/theme.context";
import { CustomTabBar } from "@/components/navigation/custom-tab-bar";
import { queryClient } from "@/lib/query-client";
import { prefetchCurrentProductStats } from "@/hooks/use-product-stats";
import { prefetchGoal } from "@/hooks/use-goal";

export default function TabsLayout() {
  const { colors } = useTheme();

  useEffect(() => {
    void prefetchCurrentProductStats(queryClient);
    void prefetchGoal(queryClient);
  }, []);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="month-list" />
      <Tabs.Screen name="create-product" />
      <Tabs.Screen name="itens" />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
