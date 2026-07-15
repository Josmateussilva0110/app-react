import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme.context";
import { formatBRLCompact } from "../constants";

export type VBarItem = {
  label: string;
  value: number;
  color: string;
};

const CHART_HEIGHT = 150;

export function VerticalBarChart({ items }: { items: VBarItem[] }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...items.map((i) => i.value));

  if (items.length === 0) {
    return <Text style={[styles.empty, { color: colors.textSecondary }]}>Sem dados no período.</Text>;
  }

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const ratio = Math.max(0.02, item.value / max);
        return (
          <View key={item.label} style={styles.col}>
            <Text style={[styles.value, { color: colors.textSecondary }]} numberOfLines={1}>
              {formatBRLCompact(item.value)}
            </Text>
            <View style={[styles.barArea, { height: CHART_HEIGHT }]}>
              <View
                style={[
                  styles.bar,
                  { height: ratio * CHART_HEIGHT, backgroundColor: item.color },
                ]}
              />
            </View>
            <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 8,
  },
  col: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barArea: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "70%",
    minHeight: 4,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  value: {
    fontSize: 11,
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  empty: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
});
