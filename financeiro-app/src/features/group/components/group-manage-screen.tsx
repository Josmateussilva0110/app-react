import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { Crown, LogOut, Share2, UserPlus, Users } from "lucide-react-native";
import { AppShell } from "@/components/appShell";
import { ScreenWrapper } from "@/components/layout/screen-wrapper";
import { GroupFormLayout, groupFormStyles } from "@/features/group/components/group-form-layout";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import {
  useGroup,
  useCreateGroupInvite,
  useLeaveGroup,
  useUpdateGroup,
} from "@/hooks/use-group";

export function GroupManageScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { show } = useToast();

  const { data, isLoading, refetch } = useGroup();
  const updateGroup = useUpdateGroup();
  const createInvite = useCreateGroupInvite();
  const leaveGroup = useLeaveGroup();

  const group = data?.group ?? null;
  const isOwner = group?.role === "owner";
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    if (group) setName(group.name);
  }, [group?.id, group?.name]);

  useEffect(() => {
    if (!isLoading && !group) {
      router.replace("/(protected)/(tabs)/profile");
    }
  }, [isLoading, group, router]);

  const nameDirty = group ? name.trim() !== group.name : false;

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      show("error", "Informe um nome com ao menos 2 caracteres.");
      return;
    }

    try {
      await updateGroup.mutateAsync(trimmed);
      show("success", "Nome do grupo atualizado.");
      await refetch();
    } catch (error: unknown) {
      show("error", error instanceof Error ? error.message : "Erro ao salvar nome.");
    }
  };

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
              show("success", "Você saiu do grupo.");
              router.replace("/(protected)/(tabs)/profile");
            } catch (error: unknown) {
              show("error", error instanceof Error ? error.message : "Erro ao sair do grupo.");
            }
          },
        },
      ]
    );
  };

  if (isLoading || !group) {
    return (
      <AppShell title="Meu grupo" subtitle="Carregando..." showBack>
        <ScreenWrapper>
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        </ScreenWrapper>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Meu grupo"
      subtitle={isOwner ? "Você é o dono do grupo" : "Membro do grupo"}
      showBack
    >
      <ScreenWrapper>
        <GroupFormLayout>
          <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nome do grupo</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome do grupo"
              placeholderTextColor={colors.textSecondary}
              style={[
                groupFormStyles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                !isOwner && styles.inputReadOnly,
              ]}
              maxLength={60}
              editable={isOwner && !updateGroup.isPending}
            />
            {isOwner && (
              <TouchableOpacity
                style={[
                  groupFormStyles.button,
                  { backgroundColor: colors.primary },
                  (!nameDirty || updateGroup.isPending) && groupFormStyles.disabled,
                ]}
                activeOpacity={0.85}
                onPress={handleSaveName}
                disabled={!nameDirty || updateGroup.isPending}
              >
                {updateGroup.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={groupFormStyles.buttonText}>Salvar nome</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Users size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Membros ({group.members.length})
              </Text>
            </View>

            <View style={styles.membersList}>
              {group.members.map((member) => (
                <View
                  key={member.id}
                  style={[styles.memberRow, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: `${colors.primary}18` }]}>
                    <Text style={[styles.memberInitial, { color: colors.primary }]}>
                      {(member.name.trim()[0] ?? "?").toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                      {member.name}
                    </Text>
                    {member.role === "owner" && (
                      <View style={styles.ownerBadge}>
                        <Crown size={12} color={colors.primary} />
                        <Text style={[styles.ownerBadgeText, { color: colors.textSecondary }]}>Dono</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {isOwner && (
            <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Convidar membros</Text>
              <Text style={[groupFormStyles.hint, { color: colors.textSecondary }]}>
                Gere um código de 6 caracteres válido por 7 dias.
              </Text>

              <TouchableOpacity
                style={[
                  groupFormStyles.button,
                  styles.inviteButton,
                  { backgroundColor: colors.primary },
                  createInvite.isPending && groupFormStyles.disabled,
                ]}
                activeOpacity={0.85}
                onPress={handleInvite}
                disabled={createInvite.isPending}
              >
                {createInvite.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <UserPlus size={18} color="#fff" />
                    <Text style={groupFormStyles.buttonText}>Gerar convite</Text>
                  </>
                )}
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
            style={[styles.leaveButton, leaveGroup.isPending && groupFormStyles.disabled]}
            activeOpacity={0.85}
            onPress={handleLeave}
            disabled={leaveGroup.isPending}
          >
            <LogOut size={18} color={colors.danger} />
            <Text style={[styles.leaveText, { color: colors.danger }]}>
              {leaveGroup.isPending ? "Saindo..." : "Sair do grupo"}
            </Text>
          </TouchableOpacity>
        </GroupFormLayout>
      </ScreenWrapper>
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    loading: {
      paddingVertical: 48,
      alignItems: "center",
    },
    section: {
      width: "100%",
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      gap: 12,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
    },
    inputReadOnly: {
      opacity: 0.85,
    },
    membersList: {
      gap: 10,
    },
    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
    },
    memberAvatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    memberInitial: {
      fontSize: 16,
      fontWeight: "800",
    },
    memberInfo: {
      flex: 1,
      gap: 4,
    },
    memberName: {
      fontSize: 15,
      fontWeight: "600",
    },
    ownerBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ownerBadgeText: {
      fontSize: 12,
      fontWeight: "600",
    },
    inviteButton: {
      flexDirection: "row",
      gap: 8,
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
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      marginTop: 4,
    },
    leaveText: {
      fontSize: 15,
      fontWeight: "700",
    },
  });
