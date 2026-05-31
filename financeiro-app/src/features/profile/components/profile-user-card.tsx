import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { User as UserIcon, Save } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

// Substituir por dados reais do useAuth quando disponível
const MOCK_USER = {
  name: "Mateus",
  email: "mateus@email.com",
};

export function ProfileUserCard() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [name, setName] = useState(MOCK_USER.name);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Informe um nome.");
      return;
    }
    Alert.alert("Sucesso", "Perfil atualizado.");
  };

  return (
    <View style={styles.card}>
      {/* Avatar + info */}
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <UserIcon size={28} color="#fff" />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {MOCK_USER.name}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {MOCK_USER.email}
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Nome de exibição</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Save size={18} color="#fff" />
          <Text style={styles.buttonText}>Salvar alterações</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 24,
      padding: 20,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
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
      backgroundColor: colors.primary,
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
      color: colors.text,
    },
    userEmail: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textSecondary,
    },
    form: {
      marginTop: 24,
      gap: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    input: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 16,
      fontSize: 15,
      backgroundColor: colors.background,
      borderColor: colors.backgroundSelected,
      color: colors.text,
    },
    button: {
      height: 52,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
    },
    buttonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });