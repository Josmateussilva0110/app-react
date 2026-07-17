import { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppShell } from "@/components/appShell";
import { ScreenWrapper } from "@/components/layout/screen-wrapper";
import { useTheme } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import { useJoinGroup } from "@/hooks/use-group";

function paramString(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "";
  return value.trim().toUpperCase();
}

export default function JoinGroupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const { show } = useToast();
  const joinGroup = useJoinGroup();
  const [code, setCode] = useState(() => paramString(params.code));

  useEffect(() => {
    const fromLink = paramString(params.code);
    if (fromLink) setCode(fromLink);
  }, [params.code]);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      show("error", "O código deve ter 6 caracteres.");
      return;
    }

    try {
      await joinGroup.mutateAsync(trimmed);
      show("success", "Você entrou no grupo!");
      router.back();
    } catch (error: unknown) {
      show("error", error instanceof Error ? error.message : "Erro ao entrar no grupo.");
    }
  };

  return (
    <AppShell title="Entrar no grupo" subtitle="Use o código enviado pelo dono" showBack>
      <ScreenWrapper style={styles.wrapper}>
        <Text style={[styles.label, { color: colors.text }]}>Código de convite</Text>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          placeholder="A3K9F2"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
          ]}
          maxLength={6}
          autoCapitalize="characters"
          editable={!joinGroup.isPending}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, joinGroup.isPending && styles.disabled]}
          activeOpacity={0.85}
          onPress={handleJoin}
          disabled={joinGroup.isPending}
        >
          {joinGroup.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
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
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
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
