import { useWindowDimensions, View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme.context";

import { AuthHeader } from "../features/auth/components/auth-header";
import { LoginForm } from "../features/auth/components/login-form";
import { LoginFooter } from "../features/auth/components/login-footer";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAwareScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: width < 380 ? 16 : 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={120}
        extraHeight={120}
        enableAutomaticScroll
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader subtitle="Entre para gerenciar seus gastos" />

        <View
          style={[
            styles.card,
            {
              maxWidth: isTablet ? 500 : 420,
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <LoginForm />
          <LoginFooter />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingTop: 32,
    paddingBottom: 80,
  },
  card: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
});