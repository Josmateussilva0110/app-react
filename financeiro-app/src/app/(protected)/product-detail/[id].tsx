import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

import { useProducts } from "@/lib/storage";
import { useTheme } from "@/context/theme.context";
import { ProductDetailScreen } from "@/features/product/components/detail";

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const products = useProducts();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Produto não encontrado
        </Text>
      </View>
    );
  }

  return <ProductDetailScreen product={product} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
