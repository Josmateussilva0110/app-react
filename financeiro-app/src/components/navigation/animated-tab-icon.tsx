import React from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface Props {
  focused: boolean;
  children: React.ReactNode;
}

export function AnimatedTabIcon({
  focused,
  children,
}: Props) {
  const style = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(
          focused ? 1.08 : 1,
          {
            duration: 220,
          }
        ),
      },
      {
        translateY: withTiming(
          focused ? -2 : 0,
          {
            duration: 220,
          }
        ),
      },
    ],
  }));

  return (
    <Animated.View style={style}>
      {children}
    </Animated.View>
  );
}