import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useTheme } from "@/context/theme.context";
import type { ProductResponse } from "@app/shared";
import type { LayoutScale } from "../hooks/use-category-products-layout";
import { CategoryProductRow } from "./category-product-row";

type CategoryProductsListProps = {
  products: ProductResponse[];
  scale: LayoutScale;
  loading?: boolean;
  onRefresh?: () => void;
  onProductPress: (id: string) => void;
};

function CategoryProductsTableHeader({ scale }: { scale: LayoutScale }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.headerRow,
        {
          borderBottomColor: colors.border,
          paddingHorizontal: scale.headerPadH,
          paddingVertical: scale.headerPadV,
        },
      ]}
    >
      <Text
        style={[
          styles.hCell,
          styles.nameCol,
          { color: colors.textSecondary, fontSize: scale.headerSize },
        ]}
      >
        Item
      </Text>
      <Text
        style={[
          styles.hCell,
          {
            color: colors.textSecondary,
            fontSize: scale.headerSize,
            width: scale.dateWidth,
            flexShrink: 0,
            textAlign: "right",
          },
        ]}
      >
        Data
      </Text>
      <Text
        style={[
          styles.hCell,
          {
            color: colors.textSecondary,
            fontSize: scale.headerSize,
            width: scale.valueWidth,
            flexShrink: 0,
            textAlign: "right",
          },
        ]}
      >
        Valor
      </Text>
      <Text
        style={[
          styles.hCell,
          {
            color: colors.textSecondary,
            fontSize: scale.headerSize,
            width: scale.statusWidth,
            flexShrink: 0,
            textAlign: "right",
          },
        ]}
      >
        Status
      </Text>
    </View>
  );
}

export function CategoryProductsList({
  products,
  scale,
  loading = false,
  onRefresh,
  onProductPress,
}: CategoryProductsListProps) {
  const { colors } = useTheme();
  const variant = scale.useStacked ? "stacked" : "table";

  return (
    <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {!scale.useStacked && <CategoryProductsTableHeader scale={scale} />}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <Text
            style={[
              styles.empty,
              {
                color: colors.textSecondary,
                fontSize: scale.nameSize,
                paddingHorizontal: scale.padding,
              },
            ]}
          >
            Nenhum item nesta categoria para o período.
          </Text>
        }
        renderItem={({ item, index }) => (
          <CategoryProductRow
            item={item}
            index={index}
            totalCount={products.length}
            scale={scale}
            variant={variant}
            onPress={onProductPress}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hCell: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
  },
  empty: {
    textAlign: "center",
    paddingVertical: 28,
  },
});
