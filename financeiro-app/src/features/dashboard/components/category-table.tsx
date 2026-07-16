import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { categoryMeta, formatBRL } from "../constants";
import type { CategoryStat } from "@app/shared";

type CategoryTableProps = {
  rows: CategoryStat[];
  total: number;
  onCategoryPress?: (category: string) => void;
};

type CategoryRowProps = {
  row: CategoryStat;
  total: number;
  onPress?: () => void;
};

function CategoryRow({ row, total, onPress }: CategoryRowProps) {
  const { colors } = useTheme();
  const meta = categoryMeta(row.category);
  const Icon = meta.icon;
  const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
  const share = total > 0 ? Math.max(0.04, row.total / total) : 0;

  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: `${meta.color}18` }]}>
        <Icon size={18} color={meta.color} />
      </View>

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={[styles.catText, { color: colors.text }]} numberOfLines={1}>
            {meta.label}
          </Text>
          <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
            {formatBRL(row.total)}
          </Text>
        </View>

        <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
          <View
            style={[
              styles.fill,
              { width: `${share * 100}%`, backgroundColor: meta.color },
            ]}
          />
        </View>

        <View style={styles.metaLine}>
          <View style={[styles.pctBadge, { backgroundColor: `${meta.color}20` }]}>
            <Text style={[styles.pctText, { color: meta.color }]}>{pct}%</Text>
          </View>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {row.count} {row.count === 1 ? "item" : "itens"}
          </Text>
        </View>
      </View>

      {onPress && (
        <View style={[styles.chevronWrap, { backgroundColor: colors.backgroundElement }]}>
          <ChevronRight size={16} color={colors.textSecondary} />
        </View>
      )}
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.row,
          { backgroundColor: colors.backgroundElement, borderColor: colors.border },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? `${colors.primary}10` : colors.backgroundElement,
          borderColor: pressed ? `${colors.primary}40` : colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Ver itens de ${meta.label}`}
    >
      {content}
    </Pressable>
  );
}

export function CategoryTable({ rows, total, onCategoryPress }: CategoryTableProps) {
  const { colors } = useTheme();

  if (rows.length === 0) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          Nenhum gasto registrado neste período.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <CategoryRow
          key={row.category}
          row={row}
          total={total}
          onPress={onCategoryPress ? () => onCategoryPress(row.category) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  catText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  value: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.3,
    flexShrink: 0,
  },
  track: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pctText: {
    fontSize: 11,
    fontWeight: "800",
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emptyWrap: {
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  empty: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});
