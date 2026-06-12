import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
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

  const backButton = (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.7}
      style={[styles.backButton, { backgroundColor: colors.backgroundElement }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <ArrowLeft size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  function handleEdit() {
    // TODO: navegar para tela de edição quando implementada
    show("info", "Funcionalidade de edição em breve");
  }

  function handleDelete() {
    // TODO: chamar API de exclusão
    show("success", `"${product.nome}" removido com sucesso`);
    router.back();
  }

  return (
    <AppShell
      title="Detalhes"
      subtitle={product.nome}
      rightElement={backButton}
      showSettings={false}
    >
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ProductDetailHeader product={product} />
          <ProductDetailInfo product={product} />
          <ProductDetailActions
            productName={product.nome}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </ScrollView>
      </SafeAreaView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
