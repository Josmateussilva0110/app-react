import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme.context";
import { categoryMeta, formatBRL } from "../constants";
import type { CategoryStat } from "@app/shared";

type CategoryTableProps = {
  rows: CategoryStat[];
  total: number;
};

export function CategoryTable({ rows, total }: CategoryTableProps) {
  const { colors } = useTheme();

  if (rows.length === 0) {
    return (
      <Text style={[styles.empty, { color: colors.textSecondary }]}>
        Nenhum gasto registrado neste período.
      </Text>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.hCell, styles.catCol, { color: colors.textSecondary }]}>Categoria</Text>
        <Text style={[styles.hCell, styles.numCol, { color: colors.textSecondary }]}>Itens</Text>
        <Text style={[styles.hCell, styles.valCol, { color: colors.textSecondary }]}>Valor</Text>
        <Text style={[styles.hCell, styles.pctCol, { color: colors.textSecondary }]}>%</Text>
      </View>

      {rows.map((row, idx) => {
        const meta = categoryMeta(row.category);
        const Icon = meta.icon;
        const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
        return (
          <View
            key={row.category}
            style={[
              styles.row,
              idx < rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}
          >
            <View style={[styles.catCol, styles.catCell]}>
              <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
                <Icon size={15} color={meta.color} />
              </View>
              <Text style={[styles.catText, { color: colors.text }]} numberOfLines={1}>
                {meta.label}
              </Text>
            </View>
            <Text style={[styles.cell, styles.numCol, { color: colors.textSecondary }]}>
              {row.count}
            </Text>
            <Text style={[styles.cell, styles.valCol, styles.valText, { color: colors.text }]}>
              {formatBRL(row.total)}
            </Text>
            <Text style={[styles.cell, styles.pctCol, { color: colors.textSecondary }]}>
              {pct}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hCell: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  catCol: { flex: 1 },
  numCol: { width: 48, textAlign: "right" },
  valCol: { width: 96, textAlign: "right" },
  pctCol: { width: 44, textAlign: "right" },
  catCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  cell: {
    fontSize: 13,
  },
  valText: {
    fontWeight: "700",
  },
  empty: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
});
