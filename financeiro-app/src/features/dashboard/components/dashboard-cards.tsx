import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme.context";

type StatCardProps = {
  label: string;
  value: string;
  color?: string;
  loading?: boolean;
};

export function StatCard({ label, value, color, loading = false }: StatCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.statLoader} />
      ) : (
        <Text style={[styles.statValue, { color: color ?? colors.text }]} numberOfLines={1}>
          {value}
        </Text>
      )}
      <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

export function SectionCard({ title, children }: SectionCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flexGrow: 1,
    flexBasis: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLoader: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
});
