import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  DollarSign,
  Dumbbell,
  Flame,
  Gamepad2,
  Gift,
  HeartPulse,
  ListChecks,
  Package,
  Save,
  ShoppingCart,
  Tag,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";

import { useTheme } from "@/context/theme.context";
import { productSchema, type ProductFormData } from "@/schemas/product.schema";
import { FormField } from "@/components/ui/form-field";
import { DateField } from "@/components/ui/date-field";

// Input type = valores ANTES do transform (price ainda é string)
// Output type = valores APÓS o transform (price vira number — ProductFormData)
type ProductFormInput = z.input<typeof productSchema>;

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const PRIORITIES = [
  { key: "alta",  label: "Alta",  color: "#ef4444" },
  { key: "media", label: "Média", color: "#f59e0b" },
  { key: "baixa", label: "Baixa", color: "#22c55e" },
] as const;

const PAYMENT_TYPES = [
  { key: "debito",       label: "Débito" },
  { key: "credito",      label: "Crédito" },
  { key: "pix",          label: "Pix" },
  { key: "dinheiro",     label: "Dinheiro" },
  { key: "nao_comprado", label: "Não comprado" },
] as const;

const CATEGORIES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "compras",      label: "Compras",      icon: ShoppingCart },
  { key: "alimentacao",  label: "Alimentação",  icon: UtensilsCrossed },
  { key: "lazer",        label: "Lazer",        icon: Gamepad2 },
  { key: "esporte",      label: "Esporte",      icon: Dumbbell },
  { key: "investimento", label: "Investimento", icon: TrendingUp },
  { key: "saude",        label: "Saúde",        icon: HeartPulse },
  { key: "presentes",    label: "Presentes",    icon: Gift },
];

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export function ProductForm() {
  const { colors } = useTheme();

  // Estado de UI (não é dado do formulário, fica fora do RHF)
  const [categoryOpen, setCategoryOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:        "",
      price:       "",
      priority:    "media",
      paymentType: "nao_comprado",
      category:    "compras",
      date:        "",
      finished:    false,
      monthList:   false,
    },
  });

  function onSubmit(data: ProductFormData) {
    // data.price já é number aqui (após o transform do zod)
    console.log("Form submitted:", data);
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >

      {/* ── Informações ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primary}15` }]}>
            <Package size={16} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações</Text>
        </View>

        {/* Nome */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Nome do Produto*"
              icon={Package}
              error={errors.name?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: Tênis de corrida"
            />
          )}
        />

        {/* Preço */}
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Preço Estimado*"
              icon={DollarSign}
              error={errors.price?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              placeholder="0,00"
            />
          )}
        />
      </View>

      {/* ── Prioridade ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: "#f59e0b15" }]}>
            <Flame size={16} color="#f59e0b" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Prioridade*</Text>
        </View>

        <Controller
          control={control}
          name="priority"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipsDistributed}>
              {PRIORITIES.map((item) => {
                const active = value === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => onChange(item.key)}
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
          )}
        />
      </View>

      {/* ── Tipo de Pagamento ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: "#3b82f615" }]}>
            <CreditCard size={16} color="#3b82f6" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tipo de Pagamento*</Text>
        </View>

        <Controller
          control={control}
          name="paymentType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipsGrid}>
              {PAYMENT_TYPES.map((item) => {
                const active = value === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => onChange(item.key)}
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
          )}
        />
      </View>

      {/* ── Categoria ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: "#8b5cf615" }]}>
            <Tag size={16} color="#8b5cf6" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categoria*</Text>
        </View>

        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <>
              {/* Trigger */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCategoryOpen((prev) => !prev)}
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
                    const selected = CATEGORIES.find((c) => c.key === value);
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

              {/* Lista */}
              {categoryOpen && (
                <View
                  style={[
                    styles.dropdownList,
                    { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                  ]}
                >
                  {CATEGORIES.map((item, index) => {
                    const active = value === item.key;
                    const IconComp = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        activeOpacity={0.7}
                        onPress={() => {
                          onChange(item.key);
                          setCategoryOpen(false);
                        }}
                        style={[
                          styles.dropdownItem,
                          active && { backgroundColor: `${colors.primary}12` },
                          index < CATEGORIES.length - 1 && {
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                          },
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
            </>
          )}
        />
      </View>

      {/* ── Data ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: "#06b6d415" }]}>
            <CalendarDays size={16} color="#06b6d4" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data*</Text>
        </View>

        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, onBlur, value } }) => (
            <DateField
            label="Data de Compra*"
            error={errors.date?.message}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
          )}
        />
      </View>

      {/* ── Opções ── */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorderDefault }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primary}15` }]}>
            <ListChecks size={16} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Opções*</Text>
        </View>

        {/* Finalizado */}
        <Controller
          control={control}
          name="finished"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              onPress={() => onChange(!value)}
              activeOpacity={0.7}
              style={[
                styles.toggleRow,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: value ? `${colors.primary}50` : colors.border,
                },
              ]}
            >
              <View style={styles.toggleLeft}>
                <CheckCircle2 size={20} color={value ? colors.primary : colors.textSecondary} />
                <View>
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>Finalizado</Text>
                  <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
                    Marcar como comprado
                  </Text>
                </View>
              </View>
              <View style={[styles.toggleTrack, { backgroundColor: value ? colors.primary : colors.border }]}>
                <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Lista do Mês */}
        <Controller
          control={control}
          name="monthList"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              onPress={() => onChange(!value)}
              activeOpacity={0.7}
              style={[
                styles.toggleRow,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: value ? `${colors.primary}50` : colors.border,
                },
              ]}
            >
              <View style={styles.toggleLeft}>
                <ListChecks size={20} color={value ? colors.primary : colors.textSecondary} />
                <View>
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>Lista do Mês</Text>
                  <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
                    Incluir na lista mensal
                  </Text>
                </View>
              </View>
              <View style={[styles.toggleTrack, { backgroundColor: value ? colors.primary : colors.border }]}>
                <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Salvar ── */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        style={styles.saveButtonWrap}
      >
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

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

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