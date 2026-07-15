import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/context/theme.context";
import { formatBRL } from "../constants";

export type MetaSegment = {
  label: string;
  value: number;
  color: string;
};

type MetaCardProps = {
  total: number;
  meta: number;
  segments: MetaSegment[];
  onSaveMeta: (value: number) => void;
  saving?: boolean;
};

export function MetaCard({ total, meta, segments, onSaveMeta, saving }: MetaCardProps) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(String(meta ?? 0));

  useEffect(() => {
    setText(meta ? String(meta) : "");
  }, [meta]);

  const barTotal = Math.max(meta, total) || 1;
  const pct = meta > 0 ? Math.round((total / meta) * 100) : 0;
  const restante = meta - total;
  const over = meta > 0 && total > meta;

  const statusColor = meta === 0 ? colors.textSecondary : over ? colors.danger : colors.success;

  const handleSave = () => {
    const parsed = Number(text.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0) {
      onSaveMeta(parsed);
      setEditing(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Meta mensal (global)</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {meta === 0 ? "Sem meta" : over ? "Acima da meta" : `${pct}% da meta`}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
        {segments.map((s) => (
          <View
            key={s.label}
            style={{ width: `${(s.value / barTotal) * 100}%`, backgroundColor: s.color }}
          />
        ))}
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={2}>
          {formatBRL(total)}{" "}
          <Text style={{ color: colors.textSecondary }}>/ {formatBRL(meta)}</Text>
        </Text>

        {!editing && (
          <Pressable onPress={() => setEditing(true)} style={styles.editLinkWrap}>
            <Text style={[styles.editLink, { color: colors.primary }]}>Editar meta</Text>
          </Pressable>
        )}
      </View>

      {editing && (
        <View style={styles.editRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement },
            ]}
          />
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>Salvar</Text>
            )}
          </Pressable>
        </View>
      )}

      <View
        style={[
          styles.callout,
          {
            backgroundColor: over ? `${colors.danger}1A` : `${colors.success}1A`,
            borderColor: over ? `${colors.danger}40` : `${colors.success}40`,
          },
        ]}
      >
        <Text style={[styles.calloutText, { color: over ? colors.danger : colors.success }]}>
          {meta === 0
            ? "Defina uma meta para acompanhar o orçamento do mês."
            : over
            ? `Estourou em ${formatBRL(total - meta)} neste mês.`
            : `Ainda restam ${formatBRL(restante)} do orçamento.`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  title: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  status: {
    fontSize: 13,
    fontWeight: "600",
  },
  track: {
    flexDirection: "row",
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaValue: {
    flex: 1,
    flexBasis: "60%",
    minWidth: 0,
    fontSize: 15,
    fontWeight: "700",
  },
  editLinkWrap: {
    flexShrink: 0,
  },
  editLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  callout: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  calloutText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
