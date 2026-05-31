import type { ReactNode } from "react";

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/theme.context";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  rightElement?: ReactNode;
  showSettings?: boolean;
};

export function AppShell({
  title,
  subtitle,
  children,
  rightElement,
  showSettings = true,
}: AppShellProps): React.JSX.Element {
  const { colors: theme } = useTheme();
  const router = useRouter();

  const headerRight = rightElement ?? (
    showSettings ? (
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        activeOpacity={0.7}
        style={[styles.settingsButton, { backgroundColor: theme.backgroundElement }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Settings size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    ) : null
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.shellBackground }]}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.shellBackground}
      />

      <LinearGradient
        colors={[theme.headerGradientStart, theme.headerGradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {headerRight ? (
            <View style={styles.headerRight}>{headerRight}</View>
          ) : null}
        </View>

        <View style={[styles.headerBorder, { backgroundColor: theme.headerBorder }]} />
      </LinearGradient>

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 8 : 4,
    paddingBottom: 0,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 16,
  },

  headerLeft: {
    flex: 1,
  },

  headerRight: {
    marginLeft: 12,
    paddingTop: 4,
  },

  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    letterSpacing: 0.2,
  },

  headerBorder: {
    height: 1,
  },

  content: {
    flex: 1,
  },
});