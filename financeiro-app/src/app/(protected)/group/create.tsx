import { useState } from "react";
import { Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { AppShell } from "@/components/appShell";
import { ScreenWrapper } from "@/components/layout/screen-wrapper";
import { useTheme } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import { useCreateGroup } from "@/hooks/use-group";
import {
  GroupFormLayout,
  groupFormStyles as styles,
} from "@/features/group/components/group-form-layout";

export default function CreateGroupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { show } = useToast();
  const createGroup = useCreateGroup();
  const [name, setName] = useState("");

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      show("error", "Informe um nome com ao menos 2 caracteres.");
      return;
    }

    try {
      await createGroup.mutateAsync(trimmed);
      show("success", "Grupo criado!");
      router.replace("/(protected)/group");
    } catch (error: unknown) {
      show("error", error instanceof Error ? error.message : "Erro ao criar grupo.");
    }
  };

  return (
    <AppShell title="Criar grupo" subtitle="Compartilhe gastos com família ou amigos" showBack>
      <ScreenWrapper>
        <GroupFormLayout>
          <Text style={[styles.label, { color: colors.text }]}>Nome do grupo</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Escolha um nome que todos do grupo reconheçam.
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Família Silva"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
            ]}
            maxLength={60}
            editable={!createGroup.isPending}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              createGroup.isPending && styles.disabled,
            ]}
            activeOpacity={0.85}
            onPress={handleCreate}
            disabled={createGroup.isPending}
          >
            {createGroup.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Criar grupo</Text>
            )}
          </TouchableOpacity>
        </GroupFormLayout>
      </ScreenWrapper>
    </AppShell>
  );
}
