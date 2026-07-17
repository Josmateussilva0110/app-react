import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GroupModeBadge } from "./group-mode-badge";

/** Indicador flutuante acima da tab bar — mostra modo pessoal ou nome do grupo. */
export function GroupModeTabIndicator() {
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 88 : 94;

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: bottomOffset }]}>
      <GroupModeBadge variant="compact" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 998,
  },
});
