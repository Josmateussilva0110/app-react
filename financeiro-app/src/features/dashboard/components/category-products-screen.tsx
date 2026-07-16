import { useMemo, useCallback } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import type { ProductResponse } from "@app/shared";
import { categoryMeta, MONTHS_FULL } from "../constants";
import { useCategoryProductsLayout } from "../hooks/use-category-products-layout";
import { CategoryProductsSummary } from "./category-products-summary";
import { CategoryProductsList } from "./category-products-list";

type CategoryProductsScreenProps = {
  category: string;
  month: number; // 1-12
  year: number;
  products: ProductResponse[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

export function CategoryProductsScreen({
  category,
  month,
  year,
  products,
  loading = false,
  error = null,
  onRefresh,
}: CategoryProductsScreenProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = useCategoryProductsLayout(width);
  const meta = categoryMeta(category);

  const total = useMemo(
    () => products.reduce((sum, p) => sum + (Number(p.price) || 0), 0),
    [products]
  );

  const subtitle = `${MONTHS_FULL[month - 1] ?? ""}/${year} · ${products.length} ${
    products.length === 1 ? "item" : "itens"
  }`;

  const openProduct = useCallback(
    (id: string) => {
      router.push(`/(protected)/product-detail/${id}` as Href);
    },
    [router]
  );

  if (loading && products.length === 0) {
    return (
      <AppShell title={meta.label} subtitle={subtitle} showBack showSettings={false}>
        <LoadingState message="Carregando itens…" />
      </AppShell>
    );
  }

  if (error && products.length === 0) {
    return (
      <AppShell title={meta.label} subtitle={subtitle} showBack showSettings={false}>
        <ErrorState error={error} onRetry={onRefresh} />
      </AppShell>
    );
  }

  return (
    <AppShell title={meta.label} subtitle={subtitle} showBack showSettings={false}>
      <SafeAreaView
        style={[styles.container, { padding: scale.padding, gap: scale.gap }]}
        edges={["bottom"]}
      >
        <CategoryProductsSummary
          color={meta.color}
          icon={meta.icon}
          total={total}
          scale={scale}
        />

        <CategoryProductsList
          products={products}
          scale={scale}
          loading={loading}
          onRefresh={onRefresh}
          onProductPress={openProduct}
        />
      </SafeAreaView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
