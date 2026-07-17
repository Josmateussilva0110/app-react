import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { Users, User, Share2, LogOut, UserPlus } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import {
  useGroup,
  useCreateGroupInvite,
  useLeaveGroup,
} from "@/hooks/use-group";

export function ProfileGroupCard() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { show } = useToast();

  const { data, isLoading } = useGroup();
  const createInvite = useCreateGroupInvite();
  const leaveGroup = useLeaveGroup();
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const group = data?.group ?? null;
  const isOwner = group?.role === "owner";

  const handleInvite = async () => {
    try {
      const invite = await createInvite.mutateAsync();
      setInviteCode(invite.code);
      show("success", "Convite gerado!");
    } catch (error: unknown) {
      show("error", error instanceof Error ? error.message : "Erro ao gerar convite.");
    }
  };

  const handleShareCode = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: `Entre no meu grupo no app usando o código: ${inviteCode}`,
    });
  };

  const handleLeave = () => {
    Alert.alert(
      "Sair do grupo",
      "Seus produtos voltarão para o modo pessoal. Os dos outros membros permanecem no grupo. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveGroup.mutateAsync();
              setInviteCode(null);
              show("success", "Você saiu do grupo.");
            } catch (error: unknown) {
              show("error", error instanceof Error ? error.message : "Erro ao sair do grupo.");
            }
          },
        },
      ]
    );
  };

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
            {isOwner ? " · Você é o dono" : ""}
          </Text>
        </View>
      </View>

      <View style={styles.membersList}>
        {group.members.map((member) => (
          <View key={member.id} style={[styles.memberChip, { backgroundColor: colors.background }]}>
            <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
              {member.name}
            </Text>
            {member.role === "owner" && (
              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>dono</Text>
            )}
          </View>
        ))}
      </View>

      {isOwner && (
        <View style={styles.inviteBlock}>
          <TouchableOpacity
            style={[styles.primaryButton, createInvite.isPending && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleInvite}
            disabled={createInvite.isPending}
          >
            {createInvite.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <UserPlus size={18} color="#fff" />
            )}
            <Text style={styles.primaryButtonText}>
              {createInvite.isPending ? "Gerando..." : "Gerar convite"}
            </Text>
          </TouchableOpacity>

          {inviteCode && (
            <TouchableOpacity
              style={[styles.codeBox, { borderColor: colors.border, backgroundColor: colors.background }]}
              activeOpacity={0.85}
              onPress={handleShareCode}
            >
              <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>Código de convite</Text>
              <View style={styles.codeRow}>
                <Text style={[styles.codeValue, { color: colors.text }]}>{inviteCode}</Text>
                <Share2 size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.leaveButton, leaveGroup.isPending && styles.buttonDisabled]}
        activeOpacity={0.85}
        onPress={handleLeave}
        disabled={leaveGroup.isPending}
      >
        <LogOut size={18} color={colors.danger} />
        <Text style={[styles.leaveText, { color: colors.danger }]}>
          {leaveGroup.isPending ? "Saindo..." : "Sair do grupo"}
        </Text>
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
      height: 48,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
    secondaryButton: {
      height: 48,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.backgroundSelected,
      backgroundColor: colors.background,
    },
    secondaryButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },
    membersList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    memberChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    memberName: {
      fontSize: 13,
      fontWeight: "600",
      maxWidth: 120,
    },
    memberRole: {
      fontSize: 11,
      fontWeight: "600",
    },
    inviteBlock: {
      gap: 10,
    },
    codeBox: {
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      gap: 6,
    },
    codeLabel: {
      fontSize: 12,
      fontWeight: "600",
    },
    codeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    codeValue: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: 4,
    },
    leaveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 8,
    },
    leaveText: {
      fontSize: 14,
      fontWeight: "700",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
