import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/schemas/auth.schema";
import { useChangePassword } from "@/hooks/use-profile";

export function ProfileChangePasswordCard() {
  const { show } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      reset();
      show("success", "Senha atualizada com sucesso!");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.";
      show("error", message);
    }
  };

  const busy = isSubmitting || changePassword.isPending;

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <KeyRound size={16} color={colors.primary} />
        <Text style={styles.sectionTitle}>Alterar senha</Text>
      </View>

      <Text style={styles.description}>
        Informe sua senha atual e escolha uma nova senha segura.
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="current_password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Senha atual*"
              icon={Lock}
              error={errors.current_password?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
            />
          )}
        />

        <Controller
          control={control}
          name="new_password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Nova senha*"
              icon={Lock}
              error={errors.new_password?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
            />
          )}
        />

        <Controller
          control={control}
          name="confirm_password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Confirmar nova senha*"
              icon={Lock}
              error={errors.confirm_password?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
            />
          )}
        />

        <TouchableOpacity
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={busy}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {busy ? "Atualizando..." : "Atualizar senha"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 24,
      padding: 20,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    description: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    form: {
      gap: 16,
    },
    button: {
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });
