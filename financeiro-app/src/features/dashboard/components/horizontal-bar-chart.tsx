import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme.context";
import { formatBRL } from "../constants";

export type HBarItem = {
  label: string;
  value: number;
  color: string;
};

export function HorizontalBarChart({ items }: { items: HBarItem[] }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...items.map((i) => i.value));

  if (items.length === 0) {
    return <Text style={[styles.empty, { color: colors.textSecondary }]}>Sem dados no período.</Text>;
  }

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const pct = Math.max(0.02, item.value / max);
        return (
          <View key={item.label} style={styles.row}>
            <View style={styles.head}>
              <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={[styles.value, { color: colors.textSecondary }]}>
                {formatBRL(item.value)}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${pct * 100}%`, backgroundColor: item.color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  row: {
    gap: 6,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
  },
  track: {
    height: 10,
    borderRadius: 6,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 6,
  },
  empty: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
});
