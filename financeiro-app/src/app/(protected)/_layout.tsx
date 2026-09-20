import { Redirect, Stack, useSegments } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/use-profile";
import { useTheme } from "@/context/theme.context";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfile();
  const segments = useSegments();
  const { colors } = useTheme();

  const onChangePasswordScreen = segments.includes("change-password-required");

  // O portão espera o perfil para saber se a senha é provisória, e essa espera
  // pode durar minutos quando a API está acordando. Ficar em branco enquanto
  // isso acontece parece app quebrado — mostre o que está acontecendo.
  if (loading) {
    return (
      <GateScreen>
        <LoadingState message="Abrindo…" />
      </GateScreen>
    );
  }

  if (!signed) return <Redirect href="/login" />;

  if (profileLoading && !profile) {
    return (
      <GateScreen>
        <LoadingState message="Carregando seu perfil…" />
      </GateScreen>
    );
  }

  // Sem perfil não dá para decidir o portão, então aqui a espera vira um erro
  // com saída — antes o app entrava direto, ignorando must_change_password.
  if (!profile) {
    return (
      <GateScreen>
        <ErrorState
          error={profileError?.message ?? "Não foi possível carregar seu perfil."}
          onRetry={() => void refetchProfile()}
        />
      </GateScreen>
    );
  }

  if (profile.must_change_password) {
    if (!onChangePasswordScreen) {
      return <Redirect href="/(protected)/change-password-required" />;
    }

    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="change-password-required"
          options={{ headerShown: false }}
        />
      </Stack>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* As tabs ficam num único "slot" do Stack */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Screens que empilham por cima das tabs */}
      <Stack.Screen name="change-password-required" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard-category" options={{ headerShown: false }} />
      <Stack.Screen name="product-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="edit-product/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="group/index" options={{ headerShown: false }} />
      <Stack.Screen name="group/create" options={{ headerShown: false }} />
      <Stack.Screen name="group/join" options={{ headerShown: false }} />
    </Stack>
  );
}

/** Fundo do portão: as telas de estado são renderizadas antes de qualquer Stack. */
function GateScreen({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.gate, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  gate: {
    flex: 1,
  },
});
