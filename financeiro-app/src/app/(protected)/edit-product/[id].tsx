import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, PackageX } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import { useTheme } from "@/context/theme.context";
import { useProducts } from "@/hooks/use-products";
import { productToFormValues } from "@/lib/product.utils";
import { ProductForm } from "@/features/product/components/product-form";

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: products = [], isLoading: loading, refetch } = useProducts();

  const product = products.find((item) => item.id === id);

  if (loading && !product) {
    return (
      <AppShell title="Editar Produto" subtitle="Carregando dados do item" showBack>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando produto…
          </Text>
        </View>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <View
        style={[
          styles.errorRoot,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorderDefault,
            },
          ]}
        >
          <ArrowLeft size={17} color={colors.text} strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.errorContent}>
          <View
            style={[
              styles.errorIconWrap,
              { backgroundColor: `${colors.error}10` },
            ]}
          >
            <PackageX size={30} color={colors.error} strokeWidth={1.8} />
          </View>

          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Produto não encontrado
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            style={[
              styles.errorBtn,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorderDefault,
              },
            ]}
          >
            <Text style={[styles.errorBtnText, { color: colors.text }]}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <AppShell title="Editar Produto" subtitle={product.name} showBack>
      <ProductForm
        key={product.id}
        mode="edit"
        productId={product.id}
        initialValues={productToFormValues(product)}
        onSuccess={refetch}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorRoot: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  errorContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: -38,
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  errorBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  errorBtnText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
