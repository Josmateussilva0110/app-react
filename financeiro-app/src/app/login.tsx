import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, LogIn, Mail, Lock } from "lucide-react-native";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { PRIMARY_COLOR, ERROR_COLOR } from "@/constants/theme";

export default function LoginPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log(data);
      Alert.alert("Bem-vindo de volta!");
      router.replace("/");
    } catch {
      Alert.alert("Erro", "Não foi possível entrar.");
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
      enableAutomaticScroll={true}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Wallet size={30} color="#fff" />
        </View>
        <Text style={styles.title}>Finanças</Text>
        <Text style={styles.subtitle}>Entre para gerenciar seus gastos</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>

        {/* E-mail */}
        <View style={styles.field}>
          <Text style={styles.label}>E-mail*</Text>
          <View style={styles.inputWrap}>
            <Mail size={16} color="#6b7280" style={styles.icon} />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Seu Email.com"
                  placeholderTextColor="#4b5563"
                />
              )}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        </View>

        {/* Senha */}
        <View style={styles.field}>
          <Text style={styles.label}>Senha*</Text>
          <View style={styles.inputWrap}>
            <Lock size={16} color="#6b7280" style={styles.icon} />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#4b5563"
                />
              )}
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
        </View>

        {/* Botão */}
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

        {/* Link cadastro */}
        <Text style={styles.footer}>
          Não tem conta?{" "}
          <Link href="/register" style={styles.link}>Cadastre-se</Link>
        </Text>

      </View>
    </KeyboardAwareScrollView>
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
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },

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
  inputError:     { borderColor: ERROR_COLOR },
  errorText:      { color: ERROR_COLOR, fontSize: 12 },

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