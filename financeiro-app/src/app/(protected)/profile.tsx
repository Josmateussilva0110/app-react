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

import {
  PRIMARY_COLOR,
} from "@/constants/theme";
import { logoutUser } from "@/services/auth.service";
import { useToast } from "@/context/toast.context";
import { ScreenWrapper } from "@/components/layout/screen-wrapper";

/**
 * EXEMPLO
 * Substitua pela sua store/context real
 */
const mockUser = {
  name: "Mateus",
  email: "mateus@email.com",
};

export default function ProfilePage() {
  const router = useRouter();
  const { show } = useToast();
  const { user } = useAuth();

  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const [isDark, setIsDark] = useState(true);

  const [name, setName] = useState(
    mockUser.name
  );

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(
        "Erro",
        "Informe um nome."
      );

      return;
    }

    Alert.alert(
      "Sucesso",
      "Perfil atualizado."
    );
  };

    const onSubmit = async () => {
      const result = await logoutUser();
  
      if (!result.success) {
        show("error", result.message);
        return;
      }
  
      show("success", result.message);
  
      router.replace("/");
    };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
    >
      <ScreenWrapper
  style={{
    paddingHorizontal:
      width < 380 ? 16 : 24,

    paddingTop: 32,
  }}
>
        <View
          style={[
            styles.content,
            {
              maxWidth: isTablet
                ? 500
                : 420,
            },
          ]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Perfil
            </Text>

            <Text style={styles.subtitle}>
              Gerencie suas preferências
            </Text>
          </View>

          {/* USER CARD */}
          <View style={styles.card}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <UserIcon
                  size={28}
                  color="#fff"
                />
              </View>

              <View style={styles.userInfo}>
                <Text
                  style={styles.userName}
                  numberOfLines={1}
                >
                  {mockUser.name}
                </Text>

                <Text
                  style={styles.userEmail}
                  numberOfLines={1}
                >
                  {mockUser.email}
                </Text>
              </View>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>
                Nome de exibição
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor="#71717A"
                style={styles.input}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={handleSave}
              >
                <Save
                  size={18}
                  color="#fff"
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Salvar alterações
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PREFERÊNCIAS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Palette
                size={16}
                color={PRIMARY_COLOR}
              />

              <Text style={styles.sectionTitle}>
                Preferências
              </Text>
            </View>

            <View style={styles.themeContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setIsDark(false)
                }
                style={[
                  styles.themeButton,
                  !isDark &&
                    styles.themeButtonActive,
                ]}
              >
                <Sun
                  size={18}
                  color="#fff"
                />

                <Text
                  style={styles.themeTitle}
                >
                  Claro
                </Text>

                <Text
                  style={
                    styles.themeDescription
                  }
                >
                  Mais luz
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setIsDark(true)
                }
                style={[
                  styles.themeButton,
                  isDark &&
                    styles.themeButtonActive,
                ]}
              >
                <Moon
                  size={18}
                  color="#fff"
                />

                <Text
                  style={styles.themeTitle}
                >
                  Escuro
                </Text>

                <Text
                  style={
                    styles.themeDescription
                  }
                >
                  Mais foco
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={onSubmit}
          >
            <LogOut
              size={18}
              color="#fff"
            />

            <Text style={styles.logoutText}>
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
    backgroundColor: "#09090B",
  },

  root: {
    flex: 1,
    backgroundColor: "#09090B",
  },

  container: {
    minHeight: "100%",
    paddingTop: 32,
    paddingBottom: 48,
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
    color: "#FFFFFF",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#A1A1AA",
  },

  card: {
    backgroundColor: "#18181B",

    borderWidth: 1,
    borderColor: "#27272A",

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

    backgroundColor: PRIMARY_COLOR,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.4,
    shadowRadius: 10,

    elevation: 8,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  userEmail: {
    marginTop: 4,
    color: "#A1A1AA",
    fontSize: 13,
  },

  form: {
    marginTop: 24,
    gap: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  input: {
    height: 52,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: "#27272A",

    backgroundColor: "#111111",

    paddingHorizontal: 16,

    color: "#fff",
    fontSize: 15,
  },

  primaryButton: {
    height: 52,

    borderRadius: 14,

    backgroundColor: PRIMARY_COLOR,

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
    color: "#fff",
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
    borderColor: "#27272A",

    borderRadius: 18,

    padding: 16,

    backgroundColor: "#111111",
  },

  themeButtonActive: {
    borderColor: PRIMARY_COLOR,
    backgroundColor:
      "rgba(38, 220, 62, 0.12)",
  },

  themeTitle: {
    marginTop: 10,

    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  themeDescription: {
    marginTop: 4,

    color: "#A1A1AA",
    fontSize: 12,
  },

  logoutButton: {
    height: 54,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#27272A",

    backgroundColor: "#18181B",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,
  },

  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});