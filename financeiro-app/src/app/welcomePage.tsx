import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme.context";
import { Spacing } from "@/constants/theme";
import { WelcomeHeader } from "../features/welcome/components/welcome-header";
import { WelcomeFeatures } from "../features/welcome/components/welcome-features";
import { WelcomeActions } from "../features/welcome/components/welcome-actions";

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          <WelcomeHeader />
          <WelcomeFeatures />
          <WelcomeActions />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: Spacing.four,
    paddingBottom: 48,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
});