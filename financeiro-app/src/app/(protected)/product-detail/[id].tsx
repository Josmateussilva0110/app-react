import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowLeft, PackageX } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProducts } from "@/lib/storage";
import { useTheme } from "@/context/theme.context";
import { ProductDetailScreen } from "@/features/product/components/detail";

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const products = useProducts();

  const product = products.find((p) => p.id === id);

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
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
            Item não encontrado
          </Text>

          <Text
            style={[styles.errorSubtitle, { color: colors.textSecondary }]}
          >
            Este item pode ter sido removido ou não existe mais na sua lista.
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

  return <ProductDetailScreen product={product} />;
}

const styles = StyleSheet.create({
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
  errorSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 240,
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