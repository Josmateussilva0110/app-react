import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  Save,
  Palette,
} from "lucide-react-native";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import { ScreenWrapper } from "@/components/layout/screen-wrapper";

const mockUser = {
  name: "Mateus",
  email: "mateus@email.com",
};

export default function ProfilePage() {
  const router = useRouter();
  const { show } = useToast();
  const { user, logout } = useAuth();
  const { mode, colors, setTheme } = useTheme();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [name, setName] = useState(mockUser.name);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Informe um nome.");
      return;
    }
    Alert.alert("Sucesso", "Perfil atualizado.");
  };

  const handleLogout = async () => {
    await logout();
    show("success", "Logout realizado com sucesso");
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <ScreenWrapper
        style={{
          paddingHorizontal: width < 380 ? 16 : 24,
          paddingTop: 32,
        }}
      >
        <View
          style={[
            styles.content,
            { maxWidth: isTablet ? 500 : 420 },
          ]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Perfil
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Gerencie suas preferências
            </Text>
          </View>

          {/* USER CARD */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <View style={styles.userRow}>
              <View
                style={[styles.avatar, { backgroundColor: colors.primary }]}
              >
                <UserIcon size={28} color="#fff" />
              </View>

              <View style={styles.userInfo}>
                <Text
                  style={[styles.userName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {mockUser.name}
                </Text>
                <Text
                  style={[styles.userEmail, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {mockUser.email}
                </Text>
              </View>
            </View>

            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.text }]}>
                Nome de exibição
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.backgroundSelected,
                    color: colors.text,
                  },
                ]}
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
                activeOpacity={0.8}
                onPress={handleSave}
              >
                <Save size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Salvar alterações</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PREFERÊNCIAS */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Palette size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Preferências
              </Text>
            </View>

            <View style={styles.themeContainer}>
              {/* Botão Claro */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTheme("light")}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.backgroundSelected,
                  },
                  mode === "light" && {
                    borderColor: colors.primary,
                    backgroundColor: colors.backgroundSelected,
                  },
                ]}
              >
                <Sun size={18} color={colors.text} />
                <Text style={[styles.themeTitle, { color: colors.text }]}>
                  Claro
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Mais luz
                </Text>
              </TouchableOpacity>

              {/* Botão Escuro */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTheme("dark")}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.backgroundSelected,
                  },
                  mode === "dark" && {
                    borderColor: colors.primary,
                    backgroundColor: colors.backgroundSelected,
                  },
                ]}
              >
                <Moon size={18} color={colors.text} />
                <Text style={[styles.themeTitle, { color: colors.text }]}>
                  Escuro
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Mais foco
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <LogOut
              size={18}
              color={colors.error}
            />
            <Text
              style={[
                styles.logoutText,
                {
                  color: colors.error,
                },
              ]}
            >
              Sair da conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  content: {
    width: "100%",
    alignSelf: "center",
    gap: 20,
  },

  header: {
    marginBottom: 4,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },

  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 18,
    fontWeight: "700",
  },

  userEmail: {
    marginTop: 4,
    fontSize: 13,
  },

  form: {
    marginTop: 24,
    gap: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },

  primaryButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  themeContainer: {
    flexDirection: "row",
    gap: 12,
  },

  themeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },

  themeTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
  },

  themeDescription: {
    marginTop: 4,
    fontSize: 12,
  },

  logoutButton: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
