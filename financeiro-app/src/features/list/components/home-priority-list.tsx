import { View, StyleSheet } from "react-native";
import { HomePrioritySection } from "./home-priority-section";
import { PRIORITY_GROUPS } from "../constants/home.constants";
import type { ProductResponse } from "@app/shared";

type Props = {
  products: ProductResponse[];

};

export function HomePriorityList({ products }: Props) {
  return (
    <View style={styles.container}>
      {PRIORITY_GROUPS.map((group) => {
        const items = products.filter(
          (product) => product.priority === group.key
        );

        if (items.length === 0) return null;

        return (
          <HomePrioritySection key={group.key} group={group} items={items} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 28,
  },
});
