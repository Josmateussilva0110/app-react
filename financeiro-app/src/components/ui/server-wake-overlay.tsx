import { Modal, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme.context";
import { Spacing } from "@/constants/theme";
import { useServerStatus } from "@/hooks/use-server-status";
import { useProducts } from "@/hooks/use-products";

export function ServerWakeOverlay() {
  const { status, attempt, maxAttempts } = useServerStatus();
  const { colors } = useTheme();
  const shouldWaitForProducts = status === "waking" || status === "retrying";
  const { isSuccess } = useProducts({ enabled: shouldWaitForProducts });

  if (!shouldWaitForProducts || isSuccess) return null;

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={[styles.title, { color: colors.text }]}>
            Acordando o servidor…
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            A primeira requisição pode levar até 1 minuto. Obrigado pela paciência ♥
            {maxAttempts > 0 && ` (tentativa ${attempt}/${maxAttempts})`}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  card: {
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    alignItems: "center",
    gap: Spacing.two,
    maxWidth: 320,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    opacity: 0.8,
  },
});