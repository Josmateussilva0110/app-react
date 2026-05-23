import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { Link, useRouter } from "expo-router";

import {
  Wallet,
  UserPlus,
  Mail,
  Lock,
  User,
} from "lucide-react-native";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";

import {
  registerSchema,
  type RegisterFormData,
} from "@/schemas/auth.schema";

import {
  PRIMARY_COLOR,
  ERROR_COLOR,
} from "@/constants/theme";

import { registerUser } from "@/services/auth.service";
import { useToast } from "@/context/toast.context";

export default function RegisterPage() {
  const router = useRouter();
  const { show } = useToast();
  const { register } = useAuth();

  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await register(data);

    if (!result.success) {
      show("error", result.message);
      return;
    }

    show("success", result.message);

    router.replace("/(protected)/home");
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
    >
      <KeyboardAwareScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: width < 380 ? 16 : 24,
            paddingBottom: 80,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={120}
        extraHeight={120}
        enableAutomaticScroll={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Wallet size={30} color="#fff" />
          </View>

          <Text style={styles.title}>Finanças</Text>

          <Text style={styles.subtitle}>
            Crie sua conta para começar
          </Text>
        </View>

        {/* Card */}
        <View
          style={[
            styles.card,
            {
              width: "100%",
              maxWidth: isTablet ? 500 : 420,
              alignSelf: "center",
            },
          ]}
        >
          {/* Nome */}
          <View style={styles.field}>
            <Text style={styles.label}>Nome*</Text>

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrap}>
                  <User
                    size={16}
                    color="#6b7280"
                    style={styles.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      errors.username && styles.inputError,
                    ]}
                    placeholder="Seu nome"
                    placeholderTextColor="#4b5563"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}
            />

            {errors.username && (
              <Text style={styles.errorText}>
                {errors.username.message}
              </Text>
            )}
          </View>

          {/* E-mail */}
          <View style={styles.field}>
            <Text style={styles.label}>E-mail*</Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrap}>
                  <Mail
                    size={16}
                    color="#6b7280"
                    style={styles.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      errors.email && styles.inputError,
                    ]}
                    placeholder="SeuEmail@email.com"
                    placeholderTextColor="#4b5563"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>
              )}
            />

            {errors.email && (
              <Text style={styles.errorText}>
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Senha */}
          <View style={styles.field}>
            <Text style={styles.label}>Senha*</Text>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrap}>
                  <Lock
                    size={16}
                    color="#6b7280"
                    style={styles.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor="#4b5563"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    returnKeyType="next"
                  />
                </View>
              )}
            />

            {errors.password && (
              <Text style={styles.errorText}>
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Confirmar senha */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Confirmar senha*
            </Text>

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrap}>
                  <Lock
                    size={16}
                    color="#6b7280"
                    style={styles.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      errors.confirmPassword &&
                        styles.inputError,
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor="#4b5563"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    returnKeyType="done"
                  />
                </View>
              )}
            />

            {errors.confirmPassword && (
              <Text style={styles.errorText}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          {/* Botão */}
          <TouchableOpacity
            style={[
              styles.button,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <UserPlus size={18} color="#fff" />

            <Text style={styles.buttonText}>
              {isSubmitting
                ? "Criando conta..."
                : "Criar conta"}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            Já tem conta?{" "}
            <Link href="/login" style={styles.link}>
              Entrar
            </Link>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  root: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  scroll: {
    flexGrow: 1,
    paddingTop: 32,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#1a1a1a",
    padding: 24,
    gap: 20,
  },

  field: {
    gap: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e5e5e5",
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
    borderColor: "#2a2a2a",
    backgroundColor: "#111",
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 15,
    color: "#fff",
  },

  inputError: {
    borderColor: ERROR_COLOR,
  },

  errorText: {
    fontSize: 12,
    color: ERROR_COLOR,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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

  footer: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },

  link: {
    color: PRIMARY_COLOR,
    fontWeight: "600",
  },
});