import { useWindowDimensions, View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme.context";

import { AuthHeader } from "../features/auth/components/auth-header";
import { ForgotPasswordForm } from "../features/auth/components/forgot-password-form";
import { ForgotPasswordFooter } from "../features/auth/components/forgot-password-footer";

export default function ForgotPasswordScreen() {
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
        <AuthHeader subtitle="Solicite ajuda para recuperar sua conta" />

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
          <ForgotPasswordForm />
          <ForgotPasswordFooter />
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
