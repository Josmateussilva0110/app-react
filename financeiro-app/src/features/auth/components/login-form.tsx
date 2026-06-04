import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { LogIn, Mail, Lock } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const { show } = useToast();
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data);

    if (!result.success) {
      show("error", result.message);
      return;
    }

    show("success", result.message);
    router.replace("/(protected)/month-list");
  };

  return (
    <View style={styles.form}>
      {/* EMAIL */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="E-mail*"
            icon={Mail}
            error={errors.email?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="SeuEmail@email.com"
            returnKeyType="next"
          />
        )}
      />

      {/* SENHA */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Senha*"
            icon={Lock}
            error={errors.password?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            placeholder="••••••••"
            returnKeyType="done"
          />
        )}
      />

      {/* BOTÃO */}
      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <LogIn size={18} color="#fff" />
        <Text style={styles.buttonText}>
          {isSubmitting ? "Entrando..." : "Entrar"}
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
