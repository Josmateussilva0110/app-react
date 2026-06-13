import { useRef, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import type { Product } from "@/lib/storage";

import { ProductDetailHeader } from "./product-detail-header";
import { ProductDetailInfo } from "./product-detail-info";
import { ProductDetailActions } from "./product-detail-actions";

interface Props {
  product: Product;
}

export function ProductDetailScreen({ product }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const { show } = useToast();

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
    show("info", "Funcionalidade de edição em breve");
  }

  function handleDelete() {
    show("success", `"${product.nome}" removido com sucesso`);
    router.back();
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        overScrollMode="never"
        contentContainerStyle={styles.scrollContent}
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
            productName={product.nome}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 52,
    gap: 16,
  },
});