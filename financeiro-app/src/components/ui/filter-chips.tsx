import React from "react";

import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { LucideIcon } from "lucide-react-native";

type FilterChipProps = {
  label: string;

  active?: boolean;

  onPress: () => void;

  activeColor: string;

  inactiveColor: string;

  textColor: string;

  icon?: LucideIcon;

  style?: StyleProp<ViewStyle>;
};

export function FilterChip({
  label,
  active,
  onPress,
  activeColor,
  inactiveColor,
  textColor,
  icon: Icon,
  style,
}: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: active
            ? activeColor
            : inactiveColor,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {Icon && (
          <Icon
            size={14}
            color={textColor}
          />
        )}

        <Text
          style={[
            styles.text,
            {
              color: textColor,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  text: {
    fontSize: 13,
    fontWeight: "700",
  },
});