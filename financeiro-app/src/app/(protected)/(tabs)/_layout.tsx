import { useEffect } from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme.context";
import { CustomTabBar } from "@/components/navigation/custom-tab-bar";
import { GroupModeTabIndicator } from "@/features/group/components/group-mode-tab-indicator";
import { queryClient } from "@/lib/query-client";
import { prefetchCurrentProductStats } from "@/hooks/use-product-stats";
import { prefetchGoal } from "@/hooks/use-goal";
import { prefetchGroup } from "@/hooks/use-group";

export default function TabsLayout() {
  const { colors } = useTheme();

  useEffect(() => {
    void prefetchCurrentProductStats(queryClient);
    void prefetchGoal(queryClient);
    void prefetchGroup(queryClient);
  }, []);

  return (
    <View style={styles.root}>
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
      <GroupModeTabIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
