import { Redirect, Tabs } from "expo-router";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { ListChecks, ShoppingBasket, User, Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/theme.context";
import { LinearGradient } from "expo-linear-gradient";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  if (loading) return null;
  if (!signed) return <Redirect href="/login" />;

  const BOTTOM = insets.bottom > 0 ? insets.bottom + 4 : 10;

  // Wider bar to accommodate 4 items + center button
  const TAB_WIDTH = width * 0.62;
  const SIDE_MARGIN = (width - TAB_WIDTH) / 2;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor: colors.background,
        },

        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,

        tabBarStyle: {
          position: "absolute",
          left: SIDE_MARGIN,
          right: SIDE_MARGIN,
          bottom: BOTTOM,
          height: 55,
          borderRadius: 18,
          backgroundColor: colors.backgroundElement,
          borderTopWidth: 0,
          paddingTop: 2,
          paddingBottom: 5,
          elevation: 0,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },

        tabBarItemStyle: {
          paddingHorizontal: 0,
          paddingVertical: 0,
          marginHorizontal: -4,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: -1,
          marginBottom: 1,
        },
      }}
    >

      <Tabs.Screen
        name="month-list"
        options={{
          title: "Lista do Mês",
          tabBarIcon: ({ color }) => (
            <ListChecks size={17} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create-product"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View style={fabStyles.wrapper}>
              <LinearGradient
                colors={[colors.fabGradientStart, colors.fabGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={fabStyles.button}
              >
                <Plus size={24} color="#fff" strokeWidth={2.5} />
              </LinearGradient>
            </View>
          ),
          tabBarItemStyle: {
            height: 55,
          },
        }}
      />

      <Tabs.Screen
        name="itens"
        options={{
          title: "Itens",
          tabBarIcon: ({ color }) => (
            <ShoppingBasket size={17} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const fabStyles = StyleSheet.create({
  wrapper: {
    position: "relative",
    top: -14,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

