import { Tabs } from "expo-router";
import { useTheme } from "@/context/theme.context";
import { CustomTabBar } from "@/components/navigation/custom-tab-bar";

export default function TabsLayout() {
  const { colors } = useTheme();

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
