import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Home
        </Text>
        <Text style={styles.user}>
          Bem-vindo, {user?.email || "usuário"}
        </Text>

        <Text style={styles.subtitle}>
          Tela inicial do aplicativo
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#94a3b8",
  },

  user: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "500",
    color: "#ffffff",
  },
});
