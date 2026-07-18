import { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

type GroupFormLayoutProps = {
  children: ReactNode;
};

export function GroupFormLayout({ children }: GroupFormLayoutProps) {
  const { width } = useWindowDimensions();
  const horizontalPad = width < 380 ? 16 : width >= 768 ? 32 : 24;
  const isTablet = width >= 768;

  return (
    <View
      style={[
        styles.container,
        {
          width: "100%",
          alignSelf: isTablet ? "center" : "stretch",
          maxWidth: isTablet ? 520 : undefined,
          paddingHorizontal: horizontalPad,
        },
      ]}
    >
      {children}
    </View>
  );
}

export const groupFormStyles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
  },
  input: {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputCode: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 6,
    textAlign: "center",
  },
  button: {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.6,
  },
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
