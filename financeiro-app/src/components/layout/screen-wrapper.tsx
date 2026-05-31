import {
  ReactNode,
} from "react";

import {
  ScrollView,
  StyleSheet,
  ViewStyle,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

export function ScreenWrapper({
  children,
  style,
}: Props) {
  const insets =
    useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingBottom:
            120 + insets.bottom,
          alignItems: "center",
          width: "100%",
        },
        style,
      ]}
      showsVerticalScrollIndicator={
        false
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
