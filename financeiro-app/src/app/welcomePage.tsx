import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Link } from "expo-router";

import {
  Wallet,
  LogIn,
  UserPlus,
  Sparkles,
  ListChecks,
  CalendarDays,
} from "lucide-react-native";

import {
  PRIMARY_COLOR,
  Spacing,
} from "@/constants/theme";

import { useTheme } from "@/context/theme.context";

export default function WelcomePage() {
  const { colors, isDark } = useTheme();

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
      title: "Gestão inteligente",
      desc: "Tenha controle total das suas finanças mensais.",
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={["top", "bottom"]}
    >
      <ScrollView
        style={[
          styles.root,
          {
            backgroundColor: colors.background,
          },
        ]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Wallet size={40} color="#fff" />
            </View>

            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              Bem-vindo ao{" "}
              <Text style={styles.titleHighlight}>
                Finanças
              </Text>
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Controle seus gastos do mês de forma simples:
              organize por prioridade, categoria e forma
              de pagamento.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map(({ icon: Icon, title, desc }) => (
              <View
                key={title}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor:
                      colors.backgroundElement,

                    borderColor:
                      colors.backgroundSelected,
                  },
                ]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(34,197,94,0.08)",
                    },
                  ]}
                >
                  <Icon
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.featureContent}>
                  <Text
                    style={[
                      styles.featureTitle,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {title}
                  </Text>

                  <Text
                    style={[
                      styles.featureDescription,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <>
                  <LogIn size={20} color="#fff" />

                  <Text style={styles.primaryButtonText}>
                    Entrar
                  </Text>
                </>
              </TouchableOpacity>
            </Link>

            <Link href="/register" asChild>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <>
                  <UserPlus size={20} color="#fff" />

                  <Text style={styles.primaryButtonText}>
                    Criar conta
                  </Text>
                </>
              </TouchableOpacity>
            </Link>
          </View>
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
    textAlign: "center",
  },

  titleHighlight: {
    color: PRIMARY_COLOR,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 15,
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

    padding: 16,
    borderRadius: 20,
  },

  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontWeight: "600",
    fontSize: 15,
  },

  featureDescription: {
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

    paddingVertical: 16,
    borderRadius: 16,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  secondaryButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});