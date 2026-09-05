import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyRound, Lock } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  requiredChangePasswordSchema,
  type RequiredChangePasswordFormData,
} from "@/schemas/auth.schema";
import { useChangePassword } from "@/hooks/use-profile";

export default function ChangePasswordRequiredScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(colors);
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequiredChangePasswordFormData>({
    resolver: zodResolver(requiredChangePasswordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const onSubmit = async (data: RequiredChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      show("success", "Senha definida com sucesso!");
      router.replace("/(protected)/(tabs)/month-list");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.";
      show("error", message);
    }
  };

  const isTablet = width >= 768;
  const busy = isSubmitting || changePassword.isPending;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: width < 380 ? 16 : 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={120}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
            <KeyRound size={28} color="#fff" />
          </View>
          <Text style={styles.title}>Defina uma nova senha</Text>
          <Text style={styles.subtitle}>
            Por segurança, você precisa criar uma senha definitiva antes de
            continuar usando o app.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              maxWidth: isTablet ? 500 : 420,
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
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
                returnKeyType="next"
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
                returnKeyType="done"
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
              {busy ? "Salvando..." : "Salvar nova senha"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingTop: 48,
      paddingBottom: 80,
    },
    header: {
      alignItems: "center",
      marginBottom: 28,
      gap: 12,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: "center",
      maxWidth: 340,
    },
    card: {
      width: "100%",
      alignSelf: "center",
      borderRadius: 20,
      borderWidth: 1,
      padding: 24,
      gap: 20,
    },
    button: {
      height: 52,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      marginTop: 4,
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
