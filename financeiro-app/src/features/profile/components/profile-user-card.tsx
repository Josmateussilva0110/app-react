import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { User as UserIcon, Save, RefreshCw } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";

export function ProfileUserCard() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { show } = useToast();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");

  // Sync local state when profile loads or updates
  useEffect(() => {
    if (profile) {
      setName(profile.username);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      show("error", "Informe um nome.");
      return;
    }

    if (name.trim() === profile?.username) {
      show("info", "Nenhuma alteração detectada.");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        username: name.trim(),
      });

      show("success", "Perfil atualizado com sucesso!");
    } catch (error: any) {
      show("error", error.message || "Não foi possível atualizar o perfil.");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.errorText}>Erro ao carregar perfil.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.8}
          onPress={() => refetch()}
        >
          <RefreshCw size={16} color="#fff" />
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasChanges = name.trim() !== profile.username;

  return (
    <View style={styles.card}>
      {/* Avatar + info */}
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <UserIcon size={28} color="#fff" />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {profile.username}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {profile.email}
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
          editable={!updateProfile.isPending}
        />

        <TouchableOpacity
          style={[
            styles.button,
            (!hasChanges || updateProfile.isPending) && styles.buttonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={!hasChanges || updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={18} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
          </Text>
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
    centered: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 160,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    errorText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    retryButton: {
      height: 42,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
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
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });