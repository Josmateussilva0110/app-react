import { View, Text, StyleSheet } from "react-native";
import {
  User,
  CheckCircle2,
  Clock,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import type { Product } from "@/lib/storage";

interface Props {
  product: Product;
}

interface InfoRowProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string;
  valueColor?: string;
}

function InfoRow({ icon: Icon, iconColor, iconBgColor, label, value, valueColor }: InfoRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, { backgroundColor: iconBgColor }]}>
          <Icon size={15} color={iconColor} />
        </View>
        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.rowValue, { color: valueColor ?? colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

export function ProductDetailInfo({ product }: Props) {
  const { colors } = useTheme();

  const statusConfig = product.status === "finalizado"
    ? { label: "Finalizado", color: colors.alertTextSuccess, icon: CheckCircle2 }
    : { label: "Pendente", color: colors.alertTextDanger, icon: Clock };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorderDefault,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Detalhes
        </Text>
      </View>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.cardBorderDefault }]} />
      </View>

      <InfoRow
        icon={statusConfig.icon}
        iconColor={statusConfig.color}
        iconBgColor={`${statusConfig.color}15`}
        label="Status"
        value={statusConfig.label}
        valueColor={statusConfig.color}
      />

      <InfoRow
        icon={User}
        iconColor={colors.textSecondary}
        iconBgColor={colors.backgroundElement}
        label="Cadastrado por"
        value={product.cadastradoPor}
      />

      <InfoRow
        icon={CalendarCheck}
        iconColor={colors.primary}
        iconBgColor={`${colors.primary}15`}
        label="Lista do mês"
        value={product.lista_mes ? "Sim" : "Não"}
        valueColor={product.lista_mes ? colors.primary : colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  divider: {
    marginVertical: 2,
  },
  dividerLine: {
    height: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});
