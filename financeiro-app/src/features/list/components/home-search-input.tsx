import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function HomeSearchInput({
  value,
  onChange,
  placeholder = "Buscar por nome...",
}: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: focused ? colors.primary : "transparent",
        },
      ]}
    >
      <Search size={18} color={colors.text + "99"} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text + "66"}
        style={[styles.input, { color: colors.text }]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange("")} hitSlop={8}>
          <X size={18} color={colors.text + "99"} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
});
