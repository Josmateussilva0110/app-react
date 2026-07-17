import { Text, StyleSheet, Pressable, type StyleProp, type ViewStyle } from "react-native";
import { User, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/theme.context";
import { useGroupMode } from "../hooks/use-group-mode";

type GroupModeBadgeProps = {
  variant?: "compact" | "default";
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function GroupModeBadge({
  variant = "default",
  onPress,
  style,
}: GroupModeBadgeProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { inGroup, badgeLabel, badgeHint, isLoading } = useGroupMode();

  if (isLoading) return null;

  const Icon = inGroup ? Users : User;
  const accent = inGroup ? colors.info : colors.primary;
  const compact = variant === "compact";

  const handlePress = onPress ?? (() => router.push("/profile"));

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.default,
        {
          backgroundColor: `${accent}14`,
          borderColor: `${accent}30`,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${badgeHint}: ${badgeLabel}. Abrir perfil.`}
    >
      <Icon size={compact ? 12 : 14} color={accent} />
      <Text
        style={[
          compact ? styles.labelCompact : styles.label,
          { color: accent },
        ]}
        numberOfLines={1}
      >
        {badgeLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    maxWidth: "100%",
  },
  compact: {
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  default: {
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },
  labelCompact: {
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
});
