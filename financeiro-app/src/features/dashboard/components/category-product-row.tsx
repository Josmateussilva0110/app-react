import { View, Text, StyleSheet, Pressable } from "react-native";
import { CheckCircle2, Circle } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { formatProductDate } from "@/lib/product.utils";
import type { ProductResponse } from "@app/shared";
import { formatBRL } from "../constants";
import type { LayoutScale } from "../hooks/use-category-products-layout";

type CategoryProductRowProps = {
  item: ProductResponse;
  index: number;
  totalCount: number;
  scale: LayoutScale;
  variant: "stacked" | "table";
  onPress: (id: string) => void;
};

function ProductStatus({ finished, scale }: { finished: boolean; scale: LayoutScale }) {
  const { colors } = useTheme();

  return (
    <>
      {finished ? (
        <CheckCircle2 size={scale.statusIcon} color={colors.success} />
      ) : (
        <Circle size={scale.statusIcon} color={colors.warning} />
      )}
      <Text style={[styles.cell, { color: colors.textSecondary, fontSize: scale.cellSize }]}>
        {finished ? "Finalizado" : "Pendente"}
      </Text>
    </>
  );
}

function ProductNameBlock({
  item,
  scale,
  numberOfLines = 1,
}: {
  item: ProductResponse;
  scale: LayoutScale;
  numberOfLines?: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.nameBlock}>
      <Text
        style={[styles.nameText, { color: colors.text, fontSize: scale.nameSize }]}
        numberOfLines={numberOfLines}
      >
        {item.name}
      </Text>
      {!!item.user_name && (
        <Text
          style={[styles.userText, { color: colors.textSecondary, fontSize: scale.userSize }]}
          numberOfLines={1}
        >
          {item.user_name}
        </Text>
      )}
    </View>
  );
}

export function CategoryProductRow({
  item,
  index,
  totalCount,
  scale,
  variant,
  onPress,
}: CategoryProductRowProps) {
  const { colors } = useTheme();
  const finished = item.finished === true;

  const rowStyle = [
    variant === "stacked" ? styles.stackedRow : styles.row,
    {
      paddingHorizontal: scale.rowPadH,
      paddingVertical: scale.rowPadV,
    },
    index < totalCount - 1 && {
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  ];

  if (variant === "stacked") {
    return (
      <Pressable
        onPress={() => onPress(item.id)}
        style={({ pressed }) => [rowStyle, pressed && { backgroundColor: colors.backgroundElement }]}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${item.name}`}
      >
        <View style={styles.stackedTop}>
          <ProductNameBlock item={item} scale={scale} numberOfLines={2} />
          <Text
            style={[styles.valueText, { color: colors.text, fontSize: scale.nameSize }]}
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
            <ProductStatus finished={finished} scale={scale} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [rowStyle, pressed && { backgroundColor: colors.backgroundElement }]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${item.name}`}
    >
      <View style={[styles.nameCol, { paddingRight: scale.gap / 2 }]}>
        <ProductNameBlock item={item} scale={scale} />
      </View>
      <Text
        style={[
          styles.cell,
          {
            color: colors.textSecondary,
            fontSize: scale.cellSize,
            width: scale.dateWidth,
            flexShrink: 0,
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
            flexShrink: 0,
            textAlign: "right",
          },
        ]}
        numberOfLines={1}
      >
        {formatBRL(item.price)}
      </Text>
      <View style={[styles.statusCol, { width: scale.statusWidth, flexShrink: 0 }]}>
        <ProductStatus finished={finished} scale={scale} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
  },
  nameBlock: {
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
  statusCol: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
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
});
