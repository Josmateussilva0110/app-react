import React, {
  useEffect,
  useState,
} from "react";

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
  const { colors, mode } =
    useTheme();

  const { width } =
    useWindowDimensions();

  const insets =
    useSafeAreaInsets();

  const BAR_WIDTH = width * 0.65;

  const BAR_HEIGHT =
    width < 370
      ? 56
      : width < 430
      ? 60
      : 64;

  const ICON_SIZE =
    width < 370
      ? 17
      : width < 430
      ? 18
      : 19;

  const FAB_SIZE =
    width < 370
      ? 56
      : width < 430
      ? 60
      : 64;

  const PILL_HEIGHT =
    width < 370
      ? 44
      : width < 430
      ? 46
      : 48;

  const PILL_TOP =
    width < 370
      ? 6
      : width < 430
      ? 7
      : 8;

  const FAB_TOP =
    width < 370
      ? -12
      : width < 430
      ? -15
      : -18;

  const MIDDLE_SPACE =
    width < 370
      ? 60
      : width < 430
      ? 70
      : 80;

  const PILL_WIDTH =
    width < 370
      ? 64
      : width < 430
      ? 70
      : 72;

  const translateX =
    useSharedValue(0);

  const [leftCenter, setLeftCenter] =
    useState(0);

  const [
    rightCenter,
    setRightCenter,
  ] = useState(0);

  const currentRoute =
    state.routes[state.index]
      ?.name;

  useEffect(() => {
    if (
      !leftCenter ||
      !rightCenter
    ) {
      return;
    }

    translateX.value =
      withTiming(
        currentRoute === "itens"
          ? rightCenter -
              PILL_WIDTH / 2
          : leftCenter -
              PILL_WIDTH / 2,
        {
          duration: 280,
        }
      );
  }, [
    currentRoute,
    leftCenter,
    rightCenter,
  ]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          translateX:
            translateX.value,
        },
      ],
    }));

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
      <View
        style={[
          styles.blurWrapper,
          {
            borderRadius:
              BAR_HEIGHT / 2,
          },
        ]}
      >
        <BlurView
          intensity={100}
          experimentalBlurMethod="dimezisBlurView"
          tint={
            mode === "dark"
              ? "dark"
              : "light"
          }
          style={[
            styles.container,
            {
              width: BAR_WIDTH,
              height: BAR_HEIGHT,
              borderRadius:
                BAR_HEIGHT / 2,

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
                width: PILL_WIDTH,
                height: PILL_HEIGHT,
                top: PILL_TOP,

                borderRadius:
                  PILL_HEIGHT / 2,

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
            onLayout={(e) => {
              const {
                x,
                width,
              } =
                e.nativeEvent.layout;

              setLeftCenter(
                x + width / 2
              );
            }}
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
                size={ICON_SIZE}
                color={
                  currentRoute ===
                  "month-list"
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </AnimatedTabIcon>
          </TouchableOpacity>

          <View
            style={{
              width:
                MIDDLE_SPACE,
            }}
          />

          <TouchableOpacity
            style={styles.tab}
            activeOpacity={0.8}
            onLayout={(e) => {
              const {
                x,
                width,
              } =
                e.nativeEvent.layout;

              setRightCenter(
                x + width / 2
              );
            }}
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
                size={ICON_SIZE}
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

      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.centerButton,
          {
            top: FAB_TOP,
          },
        ]}
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
              width: FAB_SIZE,
              height: FAB_SIZE,

              borderRadius:
                FAB_SIZE / 2,

              backgroundColor:
                colors.primary,
            },
          ]}
        >
          <Plus
            size={
              width < 370
                ? 20
                : width < 430
                ? 22
                : 24
            }
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
      overflow: "hidden",
    },

    container: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
    },

    activePill: {
      position: "absolute",
      left: 0,
    },

    tab: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    centerButton: {
      position: "absolute",
      alignSelf: "center",
      zIndex: 999,
    },

    fab: {
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