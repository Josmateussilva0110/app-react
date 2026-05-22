import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { Link, useRouter } from "expo-router";

import {
  Wallet,
  LogIn,
  Mail,
  Lock,
} from "lucide-react-native";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/toast.context";

import {
  loginSchema,
  type LoginFormData,
} from "@/schemas/auth.schema";

import {
  PRIMARY_COLOR,
  ERROR_COLOR,
} from "@/constants/theme";

export default function LoginPage() {
  const router = useRouter();
  const { show } = useToast();
  const { login } = useAuth();

  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data);

    if (!result.success) {
      show("error", result.message);
      return;
    }

    show("success", result.message);

    router.replace("/home");
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

          <Text style={styles.title}>
            Finanças
          </Text>

          <Text style={styles.subtitle}>
            Entre para gerenciar seus gastos
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
          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>
              E-mail*
            </Text>

            <Controller
              control={control}
              name="email"
              render={({
                field: {
                  onChange,
                  onBlur,
                  value,
                },
              }) => (
                <View style={styles.inputWrap}>
                  <Mail
                    size={16}
                    color="#6b7280"
                    style={styles.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      errors.email &&
                        styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="SeuEmail@email.com"
                    placeholderTextColor="#4b5563"
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
            <Text style={styles.label}>
              Senha*
            </Text>

            <Controller
              control={control}
              name="password"
              render={({
                field: {
                  onChange,
                  onBlur,
                  value,
                },
              }) => (
                <View style={styles.inputWrap}>
                  <Lock
                    size={16}
                    color="#6b7280"
                    style={styles.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      errors.password &&
                        styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#4b5563"
                    returnKeyType="done"
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

          {/* Botão */}
          <TouchableOpacity
            style={[
              styles.button,
              isSubmitting &&
                styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LogIn size={18} color="#fff" />

            <Text style={styles.buttonText}>
              {isSubmitting
                ? "Entrando..."
                : "Entrar"}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            Não tem conta?{" "}
            <Link
              href="/register"
              style={styles.link}
            >
              Cadastre-se
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
    color: ERROR_COLOR,
    fontSize: 12,
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
