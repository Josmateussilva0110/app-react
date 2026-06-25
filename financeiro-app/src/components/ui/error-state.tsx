import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/context/theme.context";

type ErrorStateProps = {
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  error,
  onRetry,
  retryLabel = "Tentar novamente",
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: colors.error }]}>{error}</Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.7}
          style={[styles.retryBtn, { borderColor: colors.primary }]}
        >
          <Text style={[styles.retryLabel, { color: colors.primary }]}>
            {retryLabel}
          </Text>
        </TouchableOpacity>
      )}
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
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});