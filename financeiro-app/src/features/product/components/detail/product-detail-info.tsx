import { View, Text, StyleSheet, Platform } from "react-native";
import {
  CheckCircle2,
  Clock,
  User,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react-native";

import { useTheme } from "@/context/theme.context";
import { ProductResponse } from "@app/shared";

interface InfoRowProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
}

function InfoRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  valueColor,
  isLast,
}: InfoRowProps) {
  const { colors } = useTheme();

  return (
    <>
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
            <Icon size={14} color={iconColor} strokeWidth={2.2} />
          </View>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
            {label}
          </Text>
        </View>
        <Text style={[styles.rowValue, { color: valueColor ?? colors.text }]}>
          {value}
        </Text>
      </View>

      {!isLast && (
        <View
          style={[
            styles.rowDivider,
            { backgroundColor: colors.cardBorderDefault },
          ]}
        />
      )}
    </>
  );
}

interface Props {
  product: ProductResponse;
}

export function ProductDetailInfo({ product }: Props) {
  const { colors } = useTheme();

  const isFinished = product.finished === true;
  const statusCfg = isFinished
    ? { label: "Finalizado", color: colors.alertTextSuccess, Icon: CheckCircle2 }
    : { label: "Pendente",   color: colors.alertTextDanger,  Icon: Clock };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorderDefault,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.07,
              shadowRadius: 24,
            },
            android: { elevation: 3 },
          }),
        },
      ]}
    >
      {/* Card header — extrato style */}
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
          INFORMAÇÕES
        </Text>
      </View>

      {/* Full-bleed divider — receipt aesthetic */}
      <View
        style={[
          styles.fullDivider,
          { backgroundColor: colors.cardBorderDefault },
        ]}
      />

      {/* Rows */}
      <View style={styles.rows}>
        <InfoRow
          icon={statusCfg.Icon}
          iconColor={statusCfg.color}
          iconBg={`${statusCfg.color}15`}
          label="Status"
          value={statusCfg.label}
          valueColor={statusCfg.color}
        />

        <InfoRow
          icon={User}
          iconColor={colors.primary}
          iconBg={`${colors.primary}15`}
          label="Cadastrado por"
          value={product.user_name}
        />

        <InfoRow
          icon={CalendarCheck}
          iconColor={colors.primary}
          iconBg={`${colors.primary}15`}
          label="Lista do mês"
          value={product.month_list ? "Sim" : "Não"}
          valueColor={
            product.month_list ? colors.primary : colors.textSecondary
          }
          isLast
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  fullDivider: {
    height: 1,
  },
  rows: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 46, // alinha com o texto, não com o ícone
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});