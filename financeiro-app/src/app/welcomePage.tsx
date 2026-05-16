import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  Wallet,
  LogIn,
  UserPlus,
  Sparkles,
  ListChecks,
  CalendarDays,
} from "lucide-react-native";
import { PRIMARY_COLOR } from "@/constants/theme";

export default function WelcomePage() {
  const router = useRouter();

  const features = [
    {
      icon: ListChecks,
      title: "Prioridades",
      desc: "Veja o que é alta, média ou baixa.",
    },
    {
      icon: CalendarDays,
      title: "Lista do mês",
      desc: "Acompanhe o que falta pagar.",
    },
    {
      icon: Sparkles,
      title: "Rápido e bonito",
      desc: "Design moderno e responsivo.",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Wallet size={40} color="#fff" />
          </View>

          <Text style={styles.title}>
            Bem-vindo ao{" "}
            <Text style={styles.titleHighlight}>Finanças</Text>
          </Text>

          <Text style={styles.subtitle}>
            Controle seus gastos do mês de forma simples:
            organize por prioridade, categoria e forma de pagamento.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map(({ icon: Icon, title, desc }) => (
            <View key={title} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Icon size={20} color="#fff" />
              </View>

              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <>
                <LogIn size={20} color="#fff" />

                <Text style={styles.primaryButtonText}>
                  Entrar
                </Text>
              </>
            </TouchableOpacity>
          </Link>

          <Link href="/register" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <>
                <UserPlus size={20} color="#fff" />

                <Text style={styles.secondaryButtonText}>
                  Criar conta
                </Text>
              </>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#09090B",
  },

  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  header: {
    alignItems: "center",
  },

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,

    backgroundColor: PRIMARY_COLOR,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.4,
    shadowRadius: 10,

    elevation: 10,
  },

  title: {
    marginTop: 24,
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },

  titleHighlight: {
    color: PRIMARY_COLOR,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 22,
  },

  featuresContainer: {
    marginTop: 32,
    gap: 12,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,

    borderWidth: 1,
    borderColor: "#27272A",

    backgroundColor: "#18181B",

    padding: 16,
    borderRadius: 20,
  },

  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: "rgba(38, 220, 62, 0.15)",

    justifyContent: "center",
    alignItems: "center",
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },

  featureDescription: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },

  buttonsContainer: {
    marginTop: 32,
    gap: 12,
  },

  primaryButton: {
    backgroundColor: PRIMARY_COLOR,

    paddingVertical: 16,
    borderRadius: 16,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#3F3F46",

    paddingVertical: 16,
    borderRadius: 16,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
