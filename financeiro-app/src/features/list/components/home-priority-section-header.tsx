import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme.context";
import type { Group } from "../constants/home.constants";

type Props = {
  group: Group;
  count: number;
};

export function HomePrioritySectionHeader({ group, count }: Props) {
  const { colors: theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[styles.dot, { backgroundColor: group.color }]}
          />
          <Text style={[styles.title, { color: theme.text }]}>
            Prioridade {group.label}
          </Text>
        </View>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {count} {count === 1 ? "item" : "itens"}
        </Text>
      </View>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  count: {
    fontSize: 12,
    fontWeight: "500",
  },
  line: {
    height: 1,
  },
});
