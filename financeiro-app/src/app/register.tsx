import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { Wallet, UserPlus, Mail, Lock, User } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { PRIMARY_COLOR } from "@/constants/theme";
//import { requestData } from "@/lib/services/request";

export default function RegisterPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {

    Toast.show({
      type: "success",
      text1: "Conta criada com sucesso!",
    });

    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
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
        <View style={styles.card}>
          {/* Nome */}
          <View style={styles.field}>
            <Text style={styles.label}>Nome*</Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrap}>
                  <User size={16} color="#6b7280" style={styles.icon} />

                  <TextInput
                    style={[
                      styles.input,
                      errors.name && styles.inputError,
                    ]}
                    placeholder="Seu nome"
                    placeholderTextColor="#4b5563"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                  />
                </View>
              )}
            />

            {errors.name && (
              <Text style={styles.errorText}>
                {errors.name.message}
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
                  <Mail size={16} color="#6b7280" style={styles.icon} />

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
                  <Lock size={16} color="#6b7280" style={styles.icon} />

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
            <Text style={styles.label}>Confirmar senha*</Text>

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrap}>
                  <Lock size={16} color="#6b7280" style={styles.icon} />

                  <TextInput
                    style={[
                      styles.input,
                      errors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor="#4b5563"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
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
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Text>
          </TouchableOpacity>

          {/* Link login */}
          <Text style={styles.footer}>
            Já tem conta?{" "}
            <Link href="/login" style={styles.link}>
              Entrar
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: "#0f0f0f" },
  scroll:   { flexGrow: 1, justifyContent: "center", padding: 24 },

  header:   { alignItems: "center", marginBottom: 40 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: PRIMARY_COLOR, alignItems: "center", justifyContent: "center",
  },
  title:    { marginTop: 16, fontSize: 26, fontWeight: "bold", color: "#fff" },
  subtitle: { marginTop: 4, fontSize: 14, color: "#6b7280" },

  card: {
    borderRadius: 20, borderWidth: 1, borderColor: "#2a2a2a",
    backgroundColor: "#1a1a1a", padding: 24, gap: 20,
  },

  field:     { gap: 6 },
  label:     { fontSize: 14, fontWeight: "500", color: "#e5e5e5" },
  inputWrap: { position: "relative", justifyContent: "center" },
  icon:      { position: "absolute", left: 12, zIndex: 1 },
  input: {
    height: 46, borderRadius: 10, borderWidth: 1, borderColor: "#2a2a2a",
    backgroundColor: "#111", paddingLeft: 38, paddingRight: 12,
    fontSize: 14, color: "#fff",
  },
  inputError:  { borderColor: PRIMARY_COLOR },
  errorText:   { fontSize: 12, color: PRIMARY_COLOR },

  button: {
    height: 48, borderRadius: 10, backgroundColor: PRIMARY_COLOR,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText:     { color: "#fff", fontSize: 15, fontWeight: "700" },

  footer: { textAlign: "center", fontSize: 14, color: "#6b7280" },
  link:   { color: PRIMARY_COLOR, fontWeight: "600" },
});