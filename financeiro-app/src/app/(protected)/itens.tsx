import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import { useProducts } from "@/lib/storage";

import { HomeSummaryCard } from "../../features/list/components/home-summary-card";
import { HomeFilters } from "../../features/list/components/home-filters";
import { HomePriorityList } from "../../features/list/components/home-priority-list";
import { HomeEmptyState } from "../../features/list/components/home-empty-state";
import { HomeFab } from "../../features/list/components/home-fab";
import type { StatusFilter } from "../../features/list/constants/home.constants";

export default function HomeScreen() {
  const products = useProducts();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const filteredProducts = useMemo(() => {
    if (statusFilter === "todos") return products;
    return products.filter((p) => p.status === statusFilter);
  }, [products, statusFilter]);

  const total = useMemo(
    () => filteredProducts.reduce((sum, p) => sum + p.preco, 0),
    [filteredProducts]
  );

  const highCount = filteredProducts.filter(
    (p) => p.prioridade === "alta"
  ).length;

  return (
    <AppShell title="Meus Itens" subtitle="Controle seus itens por prioridade">
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <HomeSummaryCard
            total={total}
            itemCount={filteredProducts.length}
            highCount={highCount}
          />

          <HomeFilters value={statusFilter} onChange={setStatusFilter} />

          {filteredProducts.length === 0 ? (
            <HomeEmptyState />
          ) : (
            <HomePriorityList products={filteredProducts} />
          )}
        </ScrollView>

        <HomeFab />
      </SafeAreaView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },
});
