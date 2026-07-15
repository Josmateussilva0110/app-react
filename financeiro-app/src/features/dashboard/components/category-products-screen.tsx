import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { CheckCircle2, Circle } from "lucide-react-native";

import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useTheme } from "@/context/theme.context";
import { formatProductDate } from "@/lib/product.utils";
import type { ProductResponse } from "@app/shared";

import { categoryMeta, formatBRL, MONTHS_FULL } from "../constants";

type CategoryProductsScreenProps = {
  category: string;
  month: number; // 1-12
  year: number;
  products: ProductResponse[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

type LayoutScale = {
  padding: number;
  gap: number;
  summaryPadding: number;
  iconSize: number;
  iconWrap: number;
  summaryLabel: number;
  summaryValue: number;
  headerPadH: number;
  headerPadV: number;
  rowPadH: number;
  rowPadV: number;
  nameSize: number;
  userSize: number;
  cellSize: number;
  headerSize: number;
  dateWidth: number;
  valueWidth: number;
  statusWidth: number;
  statusIcon: number;
  useStacked: boolean;
};

function useLayoutScale(width: number): LayoutScale {
  const isCompact = width < 360;
  const isNarrow = width < 400;
  const isTablet = width >= 480;

  return {
    padding: isCompact ? 12 : isTablet ? 24 : 16,
    gap: isCompact ? 12 : 16,
    summaryPadding: isCompact ? 12 : 14,
    iconSize: isCompact ? 16 : 18,
    iconWrap: isCompact ? 32 : 36,
    summaryLabel: isCompact ? 11 : 12,
    summaryValue: isCompact ? 18 : isTablet ? 22 : 20,
    headerPadH: isCompact ? 10 : 14,
    headerPadV: isCompact ? 8 : 10,
    rowPadH: isCompact ? 10 : 14,
    rowPadV: isCompact ? 10 : 12,
    nameSize: isCompact ? 12 : 13,
    userSize: isCompact ? 10 : 11,
    cellSize: isCompact ? 11 : 12,
    headerSize: isCompact ? 10 : 11,
    dateWidth: isCompact ? 58 : isNarrow ? 64 : 72,
    valueWidth: isCompact ? 72 : isNarrow ? 80 : 88,
    statusWidth: isCompact ? 32 : 40,
    statusIcon: isCompact ? 14 : 16,
    // Em telas muito estreitas, cards empilhados evitam colunas espremidas.
    useStacked: isCompact,
  };
}

export function CategoryProductsScreen({
  category,
  month,
  year,
  products,
  loading = false,
  error = null,
  onRefresh,
}: CategoryProductsScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = useLayoutScale(width);
  const meta = categoryMeta(category);
  const Icon = meta.icon;

  const total = useMemo(
    () => products.reduce((sum, p) => sum + (Number(p.price) || 0), 0),
    [products]
  );

  const subtitle = `${MONTHS_FULL[month - 1] ?? ""}/${year} · ${products.length} ${
    products.length === 1 ? "item" : "itens"
  }`;

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

  const openProduct = (id: string) => {
    router.push(`/(protected)/product-detail/${id}` as Href);
  };

  const renderStackedItem = ({
    item,
    index,
  }: {
    item: ProductResponse;
    index: number;
  }) => {
    const finished = item.finished === true;
    return (
      <Pressable
        onPress={() => openProduct(item.id)}
        style={({ pressed }) => [
          styles.stackedRow,
          {
            paddingHorizontal: scale.rowPadH,
            paddingVertical: scale.rowPadV,
          },
          pressed && { backgroundColor: colors.backgroundElement },
          index < products.length - 1 && {
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${item.name}`}
      >
        <View style={styles.stackedTop}>
          <View style={styles.stackedNameBlock}>
            <Text
              style={[styles.nameText, { color: colors.text, fontSize: scale.nameSize }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {!!item.user_name && (
              <Text
                style={[
                  styles.userText,
                  { color: colors.textSecondary, fontSize: scale.userSize },
                ]}
                numberOfLines={1}
              >
                {item.user_name}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.valueText,
              { color: colors.text, fontSize: scale.nameSize },
            ]}
            numberOfLines={1}
          >
            {formatBRL(item.price)}
          </Text>
        </View>
        <View style={styles.stackedBottom}>
          <Text
            style={[styles.cell, { color: colors.textSecondary, fontSize: scale.cellSize }]}
            numberOfLines={1}
          >
            {formatProductDate(item.date)}
          </Text>
          <View style={styles.stackedStatus}>
            {finished ? (
              <CheckCircle2 size={scale.statusIcon} color={colors.success} />
            ) : (
              <Circle size={scale.statusIcon} color={colors.warning} />
            )}
            <Text
              style={[styles.cell, { color: colors.textSecondary, fontSize: scale.cellSize }]}
            >
              {finished ? "Finalizado" : "Pendente"}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderTableItem = ({
    item,
    index,
  }: {
    item: ProductResponse;
    index: number;
  }) => {
    const finished = item.finished === true;
    return (
      <Pressable
        onPress={() => openProduct(item.id)}
        style={({ pressed }) => [
          styles.row,
          {
            paddingHorizontal: scale.rowPadH,
            paddingVertical: scale.rowPadV,
          },
          pressed && { backgroundColor: colors.backgroundElement },
          index < products.length - 1 && {
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${item.name}`}
      >
        <View style={[styles.nameCol, { paddingRight: scale.gap / 2 }]}>
          <Text
            style={[styles.nameText, { color: colors.text, fontSize: scale.nameSize }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {!!item.user_name && (
            <Text
              style={[
                styles.userText,
                { color: colors.textSecondary, fontSize: scale.userSize },
              ]}
              numberOfLines={1}
            >
              {item.user_name}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.cell,
            {
              color: colors.textSecondary,
              fontSize: scale.cellSize,
              width: scale.dateWidth,
              textAlign: "right",
            },
          ]}
          numberOfLines={1}
        >
          {formatProductDate(item.date)}
        </Text>
        <Text
          style={[
            styles.cell,
            styles.valueText,
            {
              color: colors.text,
              fontSize: scale.cellSize,
              width: scale.valueWidth,
              textAlign: "right",
            },
          ]}
          numberOfLines={1}
        >
          {formatBRL(item.price)}
        </Text>
        <View
          style={{
            width: scale.statusWidth,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {finished ? (
            <CheckCircle2 size={scale.statusIcon} color={colors.success} />
          ) : (
            <Circle size={scale.statusIcon} color={colors.warning} />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <AppShell title={meta.label} subtitle={subtitle} showBack showSettings={false}>
      <SafeAreaView
        style={[styles.container, { padding: scale.padding, gap: scale.gap }]}
        edges={["bottom"]}
      >
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              padding: scale.summaryPadding,
              gap: scale.gap * 0.75,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: `${meta.color}22`,
                width: scale.iconWrap,
                height: scale.iconWrap,
                borderRadius: scale.iconWrap * 0.28,
              },
            ]}
          >
            <Icon size={scale.iconSize} color={meta.color} />
          </View>
          <View style={styles.summaryText}>
            <Text
              style={[
                styles.summaryLabel,
                { color: colors.textSecondary, fontSize: scale.summaryLabel },
              ]}
            >
              Total da categoria
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: colors.text, fontSize: scale.summaryValue },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {formatBRL(total)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.table,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {!scale.useStacked && (
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
                    textAlign: "right",
                  },
                ]}
              >
                Status
              </Text>
            </View>
          )}

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
            renderItem={scale.useStacked ? renderStackedItem : renderTableItem}
          />
        </View>
      </SafeAreaView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  summaryLabel: {
    fontWeight: "600",
  },
  summaryValue: {
    fontWeight: "800",
    letterSpacing: -0.4,
  },
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    fontWeight: "600",
  },
  userText: {
    marginTop: 2,
  },
  cell: {},
  valueText: {
    fontWeight: "700",
  },
  stackedRow: {
    gap: 8,
  },
  stackedTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  stackedNameBlock: {
    flex: 1,
    minWidth: 0,
  },
  stackedBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stackedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  empty: {
    textAlign: "center",
    paddingVertical: 28,
  },
});
