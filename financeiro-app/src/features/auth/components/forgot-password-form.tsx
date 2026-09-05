import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Mail, Send } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/schemas/auth.schema";
import { requestPasswordReset } from "@/services/auth.service";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await requestPasswordReset(data);

    if (!result.success) {
      show("error", result.message);
      return;
    }

    show(
      "success",
      "Solicitação enviada. Nossa equipe entrará em contato em breve."
    );
    router.replace("/login");
  };

  return (
    <View style={styles.form}>
      <Text style={styles.description}>
        Informe o e-mail da sua conta. Nossa equipe analisará a solicitação e
        entrará em contato para confirmar sua identidade.
      </Text>

      <Controller
        control={control}
        name="identifier"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="E-mail*"
            icon={Mail}
            error={errors.identifier?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="SeuEmail@email.com"
            returnKeyType="done"
          />
        )}
      />

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Send size={18} color="#fff" />
        <Text style={styles.buttonText}>
          {isSubmitting ? "Enviando..." : "Enviar solicitação"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    form: {
      gap: 20,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    button: {
      height: 52,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 4,
      backgroundColor: colors.primary,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });
