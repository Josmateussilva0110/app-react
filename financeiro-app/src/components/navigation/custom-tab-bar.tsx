import React, { useEffect } from "react";

import {
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import {
  ListChecks,
  ShoppingBasket,
  Plus,
} from "lucide-react-native";

import { BlurView } from "expo-blur";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/context/theme.context";
import { AnimatedTabIcon } from "./animated-tab-icon";

export function CustomTabBar({
  state,
  navigation,
}: any) {
  const { colors, mode } = useTheme();

  const { width } =
    useWindowDimensions();

  const insets =
    useSafeAreaInsets();

  const BAR_WIDTH = width * 0.78;

  const translateX =
    useSharedValue(0);

  const LEFT_POSITION = 12;

  const RIGHT_POSITION =
    BAR_WIDTH - 84 - 12;

  useEffect(() => {
    const route =
      state.routes[state.index]
        ?.name;

    translateX.value =
      withTiming(
        route === "itens"
          ? RIGHT_POSITION
          : LEFT_POSITION,
        {
          duration: 280,
        }
      );
  }, [state.index]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          translateX:
            translateX.value,
        },
      ],
    }));

  const currentRoute =
    state.routes[state.index]
      ?.name;

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom:
            insets.bottom > 0
              ? insets.bottom + 8
              : 14,
        },
      ]}
    >
      {/* Wrapper com border radius */}
      <View style={styles.blurWrapper}>
        <BlurView
          intensity={100}
          experimentalBlurMethod="dimezisBlurView"
          tint={mode === "dark" ? "dark" : "light"}
          style={[
            styles.container,
            {
              width: BAR_WIDTH,
              backgroundColor:
                mode === "dark"
                  ? "rgba(20,20,22,0.75)"
                  : "rgba(255,255,255,0.85)",
              borderColor:
                mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
            },
          ]}
        >
          <Animated.View
            style={[
              styles.activePill,
              animatedStyle,
              {
                backgroundColor:
                  mode === "dark"
                    ? "rgba(34,197,94,0.18)"
                    : "rgba(34,197,94,0.12)",
              },
            ]}
          />

          <TouchableOpacity
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                "month-list"
              )
            }
          >
            <AnimatedTabIcon
              focused={
                currentRoute ===
                "month-list"
              }
            >
              <ListChecks
                size={22}
                color={
                  currentRoute ===
                  "month-list"
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </AnimatedTabIcon>
          </TouchableOpacity>

          <View style={styles.middleSpace} />

          <TouchableOpacity
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                "itens"
              )
            }
          >
            <AnimatedTabIcon
              focused={
                currentRoute ===
                "itens"
              }
            >
              <ShoppingBasket
                size={22}
                color={
                  currentRoute ===
                  "itens"
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </AnimatedTabIcon>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* FAB separado */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.centerButton}
        onPress={() =>
          navigation.navigate(
            "create-product"
          )
        }
      >
        <View
          style={[
            styles.fab,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
        >
          <Plus
            size={30}
            color="#FFF"
            strokeWidth={2.5}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
    },

    blurWrapper: {
      borderRadius: 40,
      overflow: "hidden",
    },

    container: {
      height: 78,

      borderRadius: 40,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,
    },

    activePill: {
      position: "absolute",

      top: 10,
      left: 0,

      width: 84,
      height: 58,

      borderRadius: 29,

      backgroundColor:
        "rgba(34,197,94,0.18)",
    },

    tab: {
      flex: 1,

      justifyContent: "center",
      alignItems: "center",
    },

    middleSpace: {
      width: 90,
    },

    centerButton: {
      position: "absolute",

      top: -24,

      alignSelf: "center",

      zIndex: 999,
    },

    fab: {
      width: 72,
      height: 72,

      borderRadius: 36,

      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#22C55E",

      shadowOpacity: 0.55,

      shadowRadius: 24,

      shadowOffset: {
        width: 0,
        height: 10,
      },

      elevation: 24,
    },
  });