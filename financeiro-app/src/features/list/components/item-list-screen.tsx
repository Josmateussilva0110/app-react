import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import type { Product } from "@/lib/storage";

import { HomeSummaryCard } from "./home-summary-card";
import { HomeFilters } from "./home-filters";
import { HomePriorityList } from "./home-priority-list";
import { HomeEmptyState } from "./home-empty-state";
import { HomeFab } from "./home-fab";
import type { StatusFilter } from "../constants/home.constants";

type ItemListScreenProps = {
  title: string;
  subtitle: string;
  products: Product[];
  showSummary?: boolean;
  showFab?: boolean;
};

export function ItemListScreen({
  title,
  subtitle,
  products,
  showSummary = true,
  showFab = true,
}: ItemListScreenProps) {
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("todos");

  const filteredProducts = useMemo(() => {
    if (statusFilter === "todos") {
      return products;
    }

    return products.filter(
      (product) => product.status === statusFilter
    );
  }, [products, statusFilter]);

  const total = useMemo(
    () =>
      filteredProducts.reduce(
        (sum, product) => sum + product.preco,
        0
      ),
    [filteredProducts]
  );

  const highCount = useMemo(
    () =>
      filteredProducts.filter(
        (product) => product.prioridade === "alta"
      ).length,
    [filteredProducts]
  );

  return (
    <AppShell title={title} subtitle={subtitle}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {showSummary && (
            <HomeSummaryCard
              total={total}
              itemCount={filteredProducts.length}
              highCount={highCount}
            />
          )}

          <HomeFilters
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {filteredProducts.length === 0 ? (
            <HomeEmptyState />
          ) : (
            <HomePriorityList products={filteredProducts} />
          )}
        </ScrollView>

        {showFab && <HomeFab />}
      </SafeAreaView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },
});
