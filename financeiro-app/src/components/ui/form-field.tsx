import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type Props = TextInputProps & {
  label: string;
  icon: LucideIcon;
  error?: string;
};

export function FormField({ label, icon: Icon, error, ...inputProps }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrap}>
        <Icon size={16} color={colors.textSecondary} style={styles.icon} />

        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
          ]}
          placeholderTextColor={colors.textSecondary}
          {...inputProps}
        />
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
      backgroundColor: colors.background,
      borderColor: colors.backgroundSelected,
      color: colors.text,
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
