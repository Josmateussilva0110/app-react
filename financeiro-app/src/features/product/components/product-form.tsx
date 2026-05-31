import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  Package,
  DollarSign,
  Flame,
  CreditCard,
  Tag,
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Save,
  ChevronDown,
  ShoppingCart,
  UtensilsCrossed,
  Gamepad2,
  Dumbbell,
  TrendingUp,
  HeartPulse,
  Gift,
  type LucideIcon,
} from "lucide-react-native";

import { useTheme } from "@/context/theme.context";

const PRIORITIES = [
  { key: "alta", label: "Alta", color: "#ef4444" },
  { key: "media", label: "Média", color: "#f59e0b" },
  { key: "baixa", label: "Baixa", color: "#22c55e" },
];

const PAYMENT_TYPES = [
  { key: "debito", label: "Débito" },
  { key: "credito", label: "Crédito" },
  { key: "pix", label: "Pix" },
  { key: "dinheiro", label: "Dinheiro" },
  { key: "nao_comprado", label: "Não comprado" },
];

const CATEGORIES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "compras", label: "Compras", icon: ShoppingCart },
  { key: "alimentacao", label: "Alimentação", icon: UtensilsCrossed },
  { key: "lazer", label: "Lazer", icon: Gamepad2 },
  { key: "esporte", label: "Esporte", icon: Dumbbell },
  { key: "investimento", label: "Investimento", icon: TrendingUp },
  { key: "saude", label: "Saúde", icon: HeartPulse },
  { key: "presentes", label: "Presentes", icon: Gift },
];

export function ProductForm() {
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [priority, setPriority] = useState("media");
  const [finished, setFinished] = useState(false);
  const [monthList, setMonthList] = useState(false);
  const [paymentType, setPaymentType] = useState("nao_comprado");
  const [category, setCategory] = useState("compras");
  const [date, setDate] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* ── Name & Price Section ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primary}15` }]}>
            <Package size={16} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Nome do Produto</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Whey Protein"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Preço Estimado</Text>
          <View style={styles.priceInputWrap}>
            <View style={[styles.pricePrefix, { backgroundColor: `${colors.primary}15`, borderColor: colors.border }]}>
              <DollarSign size={16} color={colors.primary} />
            </View>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                styles.priceInput,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* ── Priority Section ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: "#f59e0b15" }]}>
            <Flame size={16} color="#f59e0b" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Prioridade</Text>
        </View>

        <View style={styles.chipsDistributed}>
          {PRIORITIES.map((item) => {
            const active = priority === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setPriority(item.key)}
                activeOpacity={0.7}
                style={[
                  styles.chipDistributed,
                  {
                    backgroundColor: active ? `${item.color}18` : colors.backgroundElement,
                    borderColor: active ? `${item.color}50` : colors.border,
                  },
                ]}
              >
                <View style={[styles.chipDot, { backgroundColor: item.color }]} />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active ? item.color : colors.textSecondary,
                      fontWeight: active ? "700" : "500",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Payment Type Section ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: "#3b82f615" }]}>
            <CreditCard size={16} color="#3b82f6" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tipo de Pagamento</Text>
        </View>

        <View style={styles.chipsGrid}>
          {PAYMENT_TYPES.map((item) => {
            const active = paymentType === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setPaymentType(item.key)}
                activeOpacity={0.7}
                style={[
                  styles.chipGrid,
                  {
                    backgroundColor: active ? `${colors.primary}18` : colors.backgroundElement,
                    borderColor: active ? `${colors.primary}50` : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active ? colors.primary : colors.textSecondary,
                      fontWeight: active ? "700" : "500",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Category Section ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: "#8b5cf615" }]}>
            <Tag size={16} color="#8b5cf6" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categoria</Text>
        </View>

        {/* Dropdown trigger */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCategoryOpen(!categoryOpen)}
          style={[
            styles.dropdownTrigger,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: categoryOpen ? `${colors.primary}50` : colors.border,
            },
          ]}
        >
          <View style={styles.dropdownTriggerLeft}>
            {(() => {
              const selected = CATEGORIES.find((c) => c.key === category);
              if (!selected) return null;
              const SelIcon = selected.icon;
              return (
                <>
                  <SelIcon size={18} color={colors.primary} />
                  <Text style={[styles.dropdownTriggerText, { color: colors.text }]}>
                    {selected.label}
                  </Text>
                </>
              );
            })()}
          </View>
          <ChevronDown
            size={18}
            color={colors.textSecondary}
            style={{ transform: [{ rotate: categoryOpen ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>

        {/* Dropdown list */}
        {categoryOpen && (
          <View style={[styles.dropdownList, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            {CATEGORIES.map((item, index) => {
              const active = category === item.key;
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.7}
                  onPress={() => {
                    setCategory(item.key);
                    setCategoryOpen(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    active && { backgroundColor: `${colors.primary}12` },
                    index < CATEGORIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <IconComp size={18} color={active ? colors.primary : colors.textSecondary} />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: active ? colors.primary : colors.text },
                      active && { fontWeight: "700" },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {active && (
                    <View style={[styles.dropdownCheck, { backgroundColor: colors.primary }]}>
                      <CheckCircle2 size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ── Date Section ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: "#06b6d415" }]}>
            <CalendarDays size={16} color="#06b6d4" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
        </View>

        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="31/05/2026"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
      </View>

      {/* ── Toggles Section ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primary}15` }]}>
            <ListChecks size={16} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Opções</Text>
        </View>

        <TouchableOpacity
          onPress={() => setFinished(!finished)}
          activeOpacity={0.7}
          style={[
            styles.toggleRow,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: finished ? `${colors.primary}50` : colors.border,
            },
          ]}
        >
          <View style={styles.toggleLeft}>
            <CheckCircle2
              size={20}
              color={finished ? colors.primary : colors.textSecondary}
            />
            <View>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Finalizado</Text>
              <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
                Marcar como comprado
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.toggleTrack,
              {
                backgroundColor: finished ? colors.primary : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                finished && styles.toggleThumbActive,
              ]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMonthList(!monthList)}
          activeOpacity={0.7}
          style={[
            styles.toggleRow,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: monthList ? `${colors.primary}50` : colors.border,
            },
          ]}
        >
          <View style={styles.toggleLeft}>
            <ListChecks
              size={20}
              color={monthList ? colors.primary : colors.textSecondary}
            />
            <View>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Lista do Mês</Text>
              <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
                Incluir na lista mensal
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.toggleTrack,
              {
                backgroundColor: monthList ? colors.primary : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                monthList && styles.toggleThumbActive,
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Save Button ── */}
      <TouchableOpacity activeOpacity={0.8} style={styles.saveButtonWrap}>
        <LinearGradient
          colors={[colors.fabGradientStart, colors.fabGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveButton}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.saveText}>Salvar Produto</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },

  /* ── Section Card ── */
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  /* ── Fields ── */
  fieldGroup: {
    gap: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },

  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    fontWeight: "500",
  },

  priceInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },

  pricePrefix: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderRightWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  priceInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  /* ── Chips (distributed) ── */
  chipsDistributed: {
    flexDirection: "row",
    gap: 10,
  },

  chipDistributed: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },

  /* ── Chips (grid for payment) ── */
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chipGrid: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },

  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.1,
  },

  /* ── Dropdown ── */
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },

  dropdownTriggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dropdownTriggerText: {
    fontSize: 15,
    fontWeight: "600",
  },

  dropdownList: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  dropdownItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  dropdownCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },



  /* ── Toggles ── */
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },

  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  toggleHint: {
    fontSize: 12,
    marginTop: 1,
  },

  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: "center",
  },

  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  /* ── Save ── */
  saveButtonWrap: {
    marginTop: 4,
    borderRadius: 16,
    overflow: "hidden",
  },

  saveButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
});