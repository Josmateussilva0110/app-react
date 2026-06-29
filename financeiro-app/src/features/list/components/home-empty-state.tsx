import { useWindowDimensions, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Package, Plus } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

export function HomeEmptyState() {
  const { colors: theme } = useTheme();
  const { width } = useWindowDimensions();

  // Breakpoints: compact (< 360), normal (360–480), tablet (> 480)
  const isCompact = width < 360;
  const isTablet = width > 480;

  const scale = {
    padding: isCompact ? 24 : isTablet ? 52 : 36,
    iconWrapper: isCompact ? 56 : isTablet ? 88 : 72,
    iconWrapperRadius: isCompact ? 16 : isTablet ? 26 : 22,
    iconSize: isCompact ? 28 : isTablet ? 44 : 36,
    titleSize: isCompact ? 15 : isTablet ? 20 : 17,
    descSize: isCompact ? 13 : isTablet ? 16 : 14,
    descLineHeight: isCompact ? 18 : isTablet ? 24 : 20,
    buttonPaddingV: isCompact ? 10 : isTablet ? 16 : 12,
    buttonPaddingH: isCompact ? 16 : isTablet ? 28 : 20,
    buttonRadius: isCompact ? 12 : isTablet ? 18 : 14,
    buttonTextSize: isCompact ? 13 : isTablet ? 16 : 14,
    gap: isCompact ? 6 : isTablet ? 12 : 8,
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.emptyBg,
          borderColor: theme.emptyBorder,
          padding: scale.padding,
          gap: scale.gap,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: theme.emptyIconBg,
            width: scale.iconWrapper,
            height: scale.iconWrapper,
            borderRadius: scale.iconWrapperRadius,
          },
        ]}
      >
        <Package size={scale.iconSize} color={theme.emptyIcon} />
      </View>

      <Text style={[styles.title, { color: theme.emptyTitle, fontSize: scale.titleSize }]}>
        Nenhum gasto cadastrado
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: theme.emptyDescription,
            fontSize: scale.descSize,
            lineHeight: scale.descLineHeight,
          },
        ]}
      >
        Adicione seu primeiro produto para começar a controlar seus gastos.
      </Text>

      <Link href="/(protected)/(tabs)/create-product" asChild>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              backgroundColor: theme.emptyButtonBg,
              paddingVertical: scale.buttonPaddingV,
              paddingHorizontal: scale.buttonPaddingH,
              borderRadius: scale.buttonRadius,
              marginTop: scale.gap + 4,
            },
          ]}
        >
          <Plus size={scale.buttonTextSize + 2} color="#ffffff" />
          <Text style={[styles.buttonText, { fontSize: scale.buttonTextSize }]}>
            Adicionar produto
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 24,
    alignItems: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  description: {
    textAlign: "center",
    maxWidth: 280,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});