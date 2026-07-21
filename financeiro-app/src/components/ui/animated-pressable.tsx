import React, { useCallback } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scaleTo?: number;
  haptic?: boolean;
};

export function AnimatedPressable({
  children,
  style,
  scaleTo = 0.98,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
      scale.value = withSpring(scaleTo, { damping: 18, stiffness: 320 });
      onPressIn?.(event);
    },
    [onPressIn, scale, scaleTo]
  );

  const handlePressOut = useCallback(
    (event: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
      scale.value = withSpring(1, { damping: 16, stiffness: 280 });
      onPressOut?.(event);
    },
    [onPressOut, scale]
  );

  const handlePress = useCallback(
    (event: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
      if (haptic && !disabled) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(event);
    },
    [disabled, haptic, onPress]
  );

  return (
    <AnimatedPressableBase
      {...rest}
      disabled={disabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
