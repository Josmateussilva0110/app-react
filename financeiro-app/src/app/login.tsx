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
  LogIn,
  Mail,
  Lock,
} from "lucide-react-native";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/toast.context";
import { useTheme } from "@/context/theme.context";

import {
  loginSchema,
  type LoginFormData,
} from "@/schemas/auth.schema";

export default function LoginPage() {
  const router = useRouter();

  const { show } = useToast();
  const { login } = useAuth();
  const { colors } = useTheme();

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

  const onSubmit = async (
    data: LoginFormData
  ) => {
    const result = await login(data);

    if (!result.success) {
      show("error", result.message);
      return;
    }

    show("success", result.message);

    router.replace("/(protected)/home");
  };

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={["top", "bottom"]}
    >
      <KeyboardAwareScrollView
        style={[
          styles.root,
          {
            backgroundColor: colors.background,
          },
        ]}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal:
              width < 380 ? 16 : 24,

            paddingBottom: 80,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={120}
        extraHeight={120}
        enableAutomaticScroll
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Wallet
              size={30}
              color="#fff"
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Finanças
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Entre para gerenciar seus
            gastos
          </Text>
        </View>

        {/* CARD */}
        <View
          style={[
            styles.card,
            {
              width: "100%",
              maxWidth: isTablet
                ? 500
                : 420,

              alignSelf: "center",

              backgroundColor:
                colors.backgroundElement,

              borderColor:
                colors.backgroundSelected,
            },
          ]}
        >
          {/* EMAIL */}
          <View style={styles.field}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
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
                    color={
                      colors.textSecondary
                    }
                    style={styles.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,

                      {
                        backgroundColor:
                          colors.background,

                        borderColor:
                          colors.backgroundSelected,

                        color: colors.text,
                      },

                      errors.email &&
                        styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="SeuEmail@email.com"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                    returnKeyType="next"
                  />
                </View>
              )}
            />

            {errors.email && (
              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors.error,
                  },
                ]}
              >
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* SENHA */}
          <View style={styles.field}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
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
                    color={
                      colors.textSecondary
                    }
                    style={styles.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,

                      {
                        backgroundColor:
                          colors.background,

                        borderColor:
                          colors.backgroundSelected,

                        color: colors.text,
                      },

                      errors.password &&
                        styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                    returnKeyType="done"
                  />
                </View>
              )}
            />

            {errors.password && (
              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors.error,
                  },
                ]}
              >
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* BOTÃO */}
          <TouchableOpacity
            style={[
              styles.button,

              {
                backgroundColor:
                  colors.primary,
              },

              isSubmitting &&
                styles.buttonDisabled,
            ]}
            onPress={handleSubmit(
              onSubmit
            )}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LogIn
              size={18}
              color="#fff"
            />

            <Text style={styles.buttonText}>
              {isSubmitting
                ? "Entrando..."
                : "Entrar"}
            </Text>
          </TouchableOpacity>

          {/* FOOTER */}
          <Text
            style={[
              styles.footer,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Não tem conta?{" "}
            <Link
              href="/register"
              style={[
                styles.link,
                {
                  color: colors.primary,
                },
              ]}
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
  },

  root: {
    flex: 1,
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

    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },

  field: {
    gap: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
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
  },

  inputError: {
    borderWidth: 1.5,
  },

  errorText: {
    fontSize: 12,
  },

  button: {
    height: 52,

    borderRadius: 12,

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
  },

  link: {
    fontWeight: "600",
  },
});