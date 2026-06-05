import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
  Pressable,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarDays, Check, X } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Aplica máscara DD/MM/YYYY enquanto o usuário digita */
function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Converte DD/MM/YYYY → Date (retorna hoje se inválido) */
function toDate(value: string): Date {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const d = new Date(`${match[3]}-${match[2]}-${match[1]}`);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** Converte Date → DD/MM/YYYY */
function fromDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Props = {
  label?: string;
  error?: string;
  value: string;             // DD/MM/YYYY
  onChange: (v: string) => void;
  onBlur?: () => void;
};

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export function DateField({ label, error, value, onChange, onBlur }: Props) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);

  const [pickerOpen, setPickerOpen] = useState(false);
  // iOS: data "em rascunho" antes de confirmar
  const [staged, setStaged] = useState<Date>(new Date());

  function handleTextChange(raw: string) {
    onChange(applyMask(raw));
  }

  function handlePickerChange(_event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === "android") {
      setPickerOpen(false);
      if (_event.type === "set" && date) onChange(fromDate(date));
    } else {
      // iOS: acumula no staged — só aplica ao confirmar
      if (date) setStaged(date);
    }
  }

  function handleOpen() {
    setStaged(toDate(value));
    setPickerOpen(true);
  }

  function handleConfirm() {
    onChange(fromDate(staged));
    setPickerOpen(false);
  }

  function handleCancel() {
    setPickerOpen(false);
  }

  return (
    <View style={styles.field}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* ── Input row ── */}
      <View style={[styles.inputWrap, !!error && styles.inputWrapError]}>
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          onBlur={onBlur}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={10}
          style={styles.input}
        />

        <View style={[styles.divider, { backgroundColor: error ? colors.error : colors.backgroundSelected }]} />

        <TouchableOpacity
          onPress={handleOpen}
          activeOpacity={0.7}
          style={styles.calendarBtn}
        >
          <CalendarDays
            size={18}
            color={error ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* ── Android: DatePicker nativo (dialog) ── */}
      {Platform.OS === "android" && pickerOpen && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          display="default"
          onChange={handlePickerChange}
        />
      )}

      {/* ── iOS: bottom-sheet modal ── */}
      {Platform.OS === "ios" && (
        <Modal
          visible={pickerOpen}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <Pressable style={styles.backdrop} onPress={handleCancel} />

          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Cabeçalho */}
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleCancel} activeOpacity={0.7} style={styles.sheetAction}>
                <X size={16} color={colors.textSecondary} />
                <Text style={[styles.sheetActionText, { color: colors.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Selecionar data
              </Text>

              <TouchableOpacity onPress={handleConfirm} activeOpacity={0.7} style={styles.sheetAction}>
                <Check size={16} color={colors.primary} />
                <Text style={[styles.sheetActionText, { color: colors.primary }]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Picker */}
            <DateTimePicker
              value={staged}
              mode="date"
              display="spinner"
              onChange={handlePickerChange}
              locale="pt-BR"
              themeVariant={isDark ? "dark" : "light"}
              style={styles.picker}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    field: {
      gap: 6,
    },

    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },

    /* ── Input row ── */
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.backgroundSelected,
      backgroundColor: colors.backgroundElement,
      overflow: "hidden",
    },

    inputWrapError: {
      borderWidth: 1.5,
      borderColor: colors.error,
    },

    input: {
      flex: 1,
      height: "100%",
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.text,
    },

    divider: {
      width: 1,
      height: 28,
    },

    calendarBtn: {
      width: 48,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    errorText: {
      fontSize: 12,
      color: colors.error,
    },

    /* ── Modal backdrop ── */
    backdrop: {
      flex: 1,
      backgroundColor: "#00000055",
    },

    /* ── Bottom sheet ── */
    sheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 1,
      paddingBottom: 40,
    },

    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },

    sheetTitle: {
      fontSize: 15,
      fontWeight: "700",
    },

    sheetAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    sheetActionText: {
      fontSize: 14,
      fontWeight: "600",
    },

    picker: {
      width: "100%",
    },
  });