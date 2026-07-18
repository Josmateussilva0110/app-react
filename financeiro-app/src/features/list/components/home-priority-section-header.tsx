import { View, Text, StyleSheet } from "react-native";
import type { Group } from "../constants/home.constants";

type Props = {
  group: Group;
  count: number;
};

export function HomePrioritySectionHeader({ group, count }: Props) {
  const Icon = group.icon;

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <View
          style={[styles.iconWrapper, { backgroundColor: group.bgColor }]}
        >
          <Icon size={15} color={group.color} />
        </View>

        <Text style={[styles.title, { color: group.color }]}>
          {group.label}
        </Text>
      </View>

      <View style={[styles.countBadge, { backgroundColor: group.bgColor }]}>
        <Text style={[styles.countBadgeText, { color: group.color }]}>
          {count}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
