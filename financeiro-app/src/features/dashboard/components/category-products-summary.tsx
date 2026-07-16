import { View, Text, StyleSheet } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { formatBRL } from "../constants";
import type { LayoutScale } from "../hooks/use-category-products-layout";

type CategoryProductsSummaryProps = {
  color: string;
  icon: LucideIcon;
  total: number;
  scale: LayoutScale;
};

export function CategoryProductsSummary({
  color,
  icon: Icon,
  total,
  scale,
}: CategoryProductsSummaryProps) {
  const { colors } = useTheme();

  return (
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
            backgroundColor: `${color}22`,
            width: scale.iconWrap,
            height: scale.iconWrap,
            borderRadius: scale.iconWrap * 0.28,
          },
        ]}
      >
        <Icon size={scale.iconSize} color={color} />
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
  );
}

const styles = StyleSheet.create({
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
});
