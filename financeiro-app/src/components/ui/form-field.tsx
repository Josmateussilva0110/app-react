import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type Props = TextInputProps & {
  label: string;
  icon: LucideIcon;
  error?: string;
};

export function FormField({
  label,
  icon: Icon,
  error,
  secureTextEntry,
  ...inputProps
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const isPasswordField = Boolean(secureTextEntry);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrap}>
        <Icon size={16} color={colors.textSecondary} style={styles.icon} />

        <TextInput
          style={[
            styles.input,
            isPasswordField && styles.inputWithTrailingIcon,
            error && styles.inputError,
          ]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          {...inputProps}
        />

        {isPasswordField && (
          <TouchableOpacity
            style={styles.trailingIcon}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? "Ocultar senha" : "Mostrar senha"
            }
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color={colors.textSecondary} />
            ) : (
              <Eye size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    field: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    inputWrap: {
      position: "relative",
      justifyContent: "center",
    },
    icon: {
      position: "absolute",
      left: 12,
      zIndex: 1,
    },
    input: {
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      paddingLeft: 40,
      paddingRight: 12,
      fontSize: 15,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
      color: colors.text,
    },
    inputWithTrailingIcon: {
      paddingRight: 44,
    },
    trailingIcon: {
      position: "absolute",
      right: 12,
      zIndex: 1,
      padding: 2,
    },
    inputError: {
      borderWidth: 1.5,
      borderColor: colors.error,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
    },
  });