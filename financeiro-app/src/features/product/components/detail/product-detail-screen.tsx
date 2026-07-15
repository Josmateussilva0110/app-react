import { useRef, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { useTheme } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import type { ProductResponse } from "@app/shared";
import { PRODUCT_STATS_KEY } from "@/hooks/use-product-stats";
import { PRODUCTS_KEY } from "@/hooks/use-products";

import { requestData } from "@/services/request";

import { ProductDetailHeader } from "./product-detail-header";
import { ProductDetailInfo } from "./product-detail-info";
import { ProductDetailActions } from "./product-detail-actions";

interface Props {
  product: ProductResponse;
  onDeleted?: () => void;
}

export function ProductDetailScreen({ product, onDeleted }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const { show } = useToast();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  // Fade-in suave do conteúdo ao montar
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      delay: 60,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  function handleEdit() {
    router.push(`/(protected)/edit-product/${product.id}` as any);
  }

  async function handleDelete() {
    setDeleting(true);

    const response = await requestData({
      endpoint: `/products/${product.id}`,
      method: "DELETE",
      withAuth: true,
    });

    setDeleting(false);

    if (!response.success) {
      show("error", response.message);
      return;
    }

    show("success", response.message);
    queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    queryClient.invalidateQueries({ queryKey: PRODUCT_STATS_KEY });
    onDeleted?.();
    router.back();
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        overScrollMode="never"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 14) + 64 + 24 },
        ]}
      >
        {/* Hero — full-bleed, sem AppShell */}
        <ProductDetailHeader
          product={product}
          onBack={() => router.back()}
        />

        {/* Corpo com fade-in */}
        <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
          <ProductDetailInfo product={product} />
          <ProductDetailActions
            productName={product.name}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleting={deleting}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {},
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 52,
    gap: 16,
  },
});