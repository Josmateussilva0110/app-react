import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingDown, Package, Flame, ArrowDownCircle } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { formatBRL } from "@/lib/storage";

type Props = {
  total: number;
  itemCount: number;
  highCount: number;
};

export function HomeSummaryCard({ total, itemCount, highCount }: Props) {
  const { colors: theme } = useTheme();

  return (
    <LinearGradient
      colors={[
        theme.summaryGradientStart,
        theme.summaryGradientMid,
        theme.summaryGradientEnd,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View
        style={[styles.decorCircle, { backgroundColor: theme.summaryDecorCircle }]}
      />

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <TrendingDown size={14} color={theme.summaryLabel} />
          <Text style={[styles.label, { color: theme.summaryLabel }]}>
            Total cadastrado
          </Text>
        </View>

        <View
          style={[
            styles.itemCountBadge,
            {
              backgroundColor: theme.summaryItemBadgeBg,
              borderColor: theme.summaryItemBadgeBorder,
            },
          ]}
        >
          <Package size={12} color={theme.summaryItemBadgeText} />
          <Text style={[styles.itemCountText, { color: theme.summaryItemBadgeText }]}>
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </Text>
        </View>
      </View>

      {/* Total value */}
      <Text style={[styles.value, { color: theme.summaryValue }]}>
        {formatBRL(total)}
      </Text>

      {/* Alert row */}
      <View style={styles.alertRow}>
        {highCount > 0 ? (
          <>
            <Flame size={13} color={theme.alertTextDanger} />
            <Text style={[styles.alertText, { color: theme.alertTextDanger }]}>
              {highCount} {highCount === 1 ? "item de alta prioridade" : "itens de alta prioridade"}
            </Text>
          </>
        ) : (
          <>
            <ArrowDownCircle size={13} color={theme.alertTextSuccess} />
            <Text style={[styles.alertText, { color: theme.alertTextSuccess }]}>
              Tudo sob controle
            </Text>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -60,
    right: -60,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "600",
  },
  itemCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: "600",
  },
  value: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertText: {
    fontSize: 13,
    fontWeight: "500",
  },
});