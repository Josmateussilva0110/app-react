import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { AppShell } from "@/components/appShell";
import { ScreenWrapper } from "@/components/layout/screen-wrapper";
import { useTheme } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import { useCreateGroup } from "@/hooks/use-group";

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
      router.back();
    } catch (error: unknown) {
      show("error", error instanceof Error ? error.message : "Erro ao criar grupo.");
    }
  };

  return (
    <AppShell title="Criar grupo" subtitle="Compartilhe gastos com família ou amigos" showBack>
      <ScreenWrapper style={styles.wrapper}>
        <Text style={[styles.label, { color: colors.text }]}>Nome do grupo</Text>
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
          style={[styles.button, { backgroundColor: colors.primary }, createGroup.isPending && styles.disabled]}
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
      </ScreenWrapper>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 24,
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
    fontSize: 16,
  },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
});
