import { useEffect } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Check, Clock3, Package } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/context/theme.context";
import type { StatusFilter } from "../constants/home.constants";

type Segment = {
  key: StatusFilter;
  label: string;
  icon: typeof Package;
};

const SEGMENTS: Segment[] = [
  { key: "todos", label: "Todos", icon: Package },
  { key: "pendente", label: "Pendentes", icon: Clock3 },
  { key: "finalizado", label: "Finalizados", icon: Check },
];

type Props = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

export function HomeSegmentedFilter({ value, onChange }: Props) {
  const { colors: theme } = useTheme();
  const indicatorX = useSharedValue(0);
  const segmentWidth = useSharedValue(0);

  const activeIndex = SEGMENTS.findIndex((segment) => segment.key === value);

  useEffect(() => {
    if (segmentWidth.value <= 0) return;
    indicatorX.value = withSpring(activeIndex * segmentWidth.value, {
      damping: 20,
      stiffness: 280,
    });
  }, [activeIndex, indicatorX, segmentWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const innerWidth = event.nativeEvent.layout.width - 6;
    const width = innerWidth / SEGMENTS.length;
    segmentWidth.value = width;
    indicatorX.value = activeIndex * width;
  };

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: theme.filterChipBg,
          borderColor: theme.border,
        },
      ]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
          indicatorStyle,
        ]}
      />

      {SEGMENTS.map((segment) => {
        const active = value === segment.key;
        const Icon = segment.icon;

        return (
          <AnimatedPressable
            key={segment.key}
            style={styles.segment}
            onPress={() => onChange(segment.key)}
            haptic
          >
            <Icon
              size={14}
              color={active ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.segmentLabel,
                { color: active ? theme.text : theme.textSecondary },
              ]}
            >
              {segment.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 11,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    zIndex: 1,
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
