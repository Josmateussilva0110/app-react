import { View, Text, StyleSheet } from "react-native";
import { ProductCard } from "@/components/productCard";
import type { Group } from "../constants/home.constants";
import { useProducts } from "@/lib/storage";

type Product = ReturnType<typeof useProducts>["products"][number];

type Props = {
  group: Group;
  items: Product[];
};

export function HomePrioritySection({ group, items }: Props) {
  const Icon = group.icon;

  return (
    <View style={styles.section}>
      {/* Section header */}
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
            {items.length}
          </Text>
        </View>
      </View>

      {/* Products */}
      <View style={styles.productsContainer}>
        {items.map((product) => (
          <ProductCard key={product.id} p={product} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  productsContainer: {
    gap: 10,
  },
});