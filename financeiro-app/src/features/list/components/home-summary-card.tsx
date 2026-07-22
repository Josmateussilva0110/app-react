import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/context/theme.context";
import { formatBRL } from "@/lib/storage";

type Props = {
  total: number;
  pendingCount: number;
  finishedCount: number;
};

function SummaryMetric({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  const { colors: theme } = useTheme();

  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.metricValue,
          { color: valueColor ?? theme.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function HomeSummaryCard({
  total,
  pendingCount,
  finishedCount,
}: Props) {
  const { colors: theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 380 });
    translateY.value = withTiming(0, { duration: 380 });
  }, [opacity, translateY]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        entranceStyle,
      ]}
    >
      <View style={styles.mainMetric}>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
          TOTAL
        </Text>
        <Text style={[styles.totalValue, { color: theme.text }]}>
          {formatBRL(total)}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.sideMetrics}>
        <SummaryMetric label="Pendentes" value={String(pendingCount)} />
        <View style={[styles.dividerVertical, { backgroundColor: theme.border }]} />
        <SummaryMetric
          label="Comprados"
          value={String(finishedCount)}
          valueColor={theme.success}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mainMetric: {
    flex: 1.2,
    gap: 2,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  divider: {
    width: 1,
    height: 40,
  },
  dividerVertical: {
    width: 1,
    height: 28,
  },
  sideMetrics: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  metric: {
    alignItems: "center",
    gap: 2,
    minWidth: 56,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});
