import { Text, StyleSheet, View } from "react-native";
import { useTheme } from "@/context/theme.context";
import { getApiHostLabel } from "@/config/env";
import { getAppVersionLabel } from "@/lib/app-version";

export function ProfileVersionIndicator() {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {getAppVersionLabel()}
      </Text>
      <Text style={[styles.apiText, { color: colors.textSecondary }]}>
        API: {getApiHostLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    gap: 4,
    alignItems: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
  apiText: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "400",
  },
});
