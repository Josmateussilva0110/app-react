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
import { formatBRL, parseBRLInput } from "@/lib/format-currency";

type MetaCardProps = {
  total: number;
  meta: number;
  onSaveMeta: (
    value: number,
    options?: { onSuccess?: () => void; onError?: () => void }
  ) => void;
  saving?: boolean;
  canEdit?: boolean;
  readOnlyHint?: string;
  title?: string;
};

export function MetaCard({
  total,
  meta,
  onSaveMeta,
  saving,
  canEdit = true,
  readOnlyHint,
  title = "Meta mensal pessoal",
}: MetaCardProps) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(String(meta ?? 0));
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    setText(meta ? String(meta) : "");
  }, [meta]);

  useEffect(() => {
    if (!canEdit) setEditing(false);
  }, [canEdit]);

  const barTotal = Math.max(meta, total) || 1;
  const pct = meta > 0 ? Math.round((total / meta) * 100) : 0;
  const restante = meta - total;
  const over = meta > 0 && total > meta;

  const statusColor = meta === 0 ? colors.textSecondary : over ? colors.danger : colors.success;

  const handleSave = () => {
    const parsed = parseBRLInput(text);
    if (parsed === null) {
      setInputError("Digite um valor válido (ex.: 3000 ou 3.000,50).");
      return;
    }

    setInputError(null);
    onSaveMeta(parsed, {
      onSuccess: () => setEditing(false),
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {meta === 0 ? "Sem meta" : over ? "Acima da meta" : `${pct}% da meta`}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
        <View
          style={{
            width: `${Math.min((total / barTotal) * 100, 100)}%`,
            backgroundColor: colors.success,
            height: "100%",
            borderRadius: 7,
          }}
        />
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={2}>
          {formatBRL(total)}{" "}
          <Text style={{ color: colors.textSecondary }}>/ {formatBRL(meta)}</Text>
        </Text>

        {!editing && canEdit && (
          <Pressable onPress={() => setEditing(true)} style={styles.editLinkWrap}>
            <Text style={[styles.editLink, { color: colors.primary }]}>Editar meta</Text>
          </Pressable>
        )}
      </View>

      {!canEdit && readOnlyHint ? (
        <Text style={[styles.readOnlyHint, { color: colors.textSecondary }]}>{readOnlyHint}</Text>
      ) : null}

      {editing && (
        <View style={styles.editRow}>
          <TextInput
            value={text}
            onChangeText={(value) => {
              setText(value);
              if (inputError) setInputError(null);
            }}
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

      {inputError ? (
        <Text style={[styles.inputError, { color: colors.danger }]}>{inputError}</Text>
      ) : null}

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
  readOnlyHint: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputError: {
    fontSize: 12,
    fontWeight: "500",
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
