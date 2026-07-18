import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, User, UserPlus, Users } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useGroup } from "@/hooks/use-group";

export function ProfileGroupCard() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { data, isLoading } = useGroup();

  const group = data?.group ?? null;

  if (isLoading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}18` }]}>
            <User size={20} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Modo pessoal</Text>
            <Text style={styles.subtitle}>Seus produtos são visíveis só para você.</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/(protected)/group/create")}
          >
            <Users size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Criar grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/(protected)/group/join")}
          >
            <UserPlus size={18} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Entrar com código
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.info}18` }]}>
          <Users size={20} color={colors.info} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.subtitle}>
            {group.members.length} {group.members.length === 1 ? "membro" : "membros"}
            {group.role === "owner" ? " · Você é o dono" : " · Membro"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.manageButton, { borderColor: colors.border, backgroundColor: colors.background }]}
        activeOpacity={0.85}
        onPress={() => router.push("/(protected)/group")}
      >
        <Text style={[styles.manageButtonText, { color: colors.text }]}>Gerenciar grupo</Text>
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
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
      gap: 16,
    },
    centered: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 100,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    actions: {
      gap: 10,
    },
    primaryButton: {
      width: "100%",
      minHeight: 48,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
    secondaryButton: {
      width: "100%",
      minHeight: 48,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.backgroundSelected,
      backgroundColor: colors.background,
    },
    secondaryButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },
    manageButton: {
      width: "100%",
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },
    manageButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },
  });
