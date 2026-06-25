import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/context/theme.context";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = "Carregando…",
}: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
});
