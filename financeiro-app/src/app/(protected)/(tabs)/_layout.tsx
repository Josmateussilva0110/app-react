import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme.context";
import { CustomTabBar } from "@/components/navigation/custom-tab-bar";
import { GroupModeTabIndicator } from "@/features/group/components/group-mode-tab-indicator";

export default function TabsLayout() {
  const { colors } = useTheme();

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
