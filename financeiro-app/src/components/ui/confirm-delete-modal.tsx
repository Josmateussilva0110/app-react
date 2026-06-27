import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { AlertTriangle, Trash2, X } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
  visible: boolean;
  productName: string;
  deleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmDeleteModal({
  visible,
  productName,
  deleting = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const { colors } = useTheme();

  // Animated values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale     = useRef(new Animated.Value(0.88)).current;
  const cardOpacity   = useRef(new Animated.Value(0)).current;

  // ── Enter / exit animations ──────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          damping: 18,
          stiffness: 260,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 0.88,
          damping: 20,
          stiffness: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleConfirm() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onConfirm();
  }

  function handleCancel() {
    Haptics.selectionAsync();
    onCancel();
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"   // controlamos manualmente
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: `${colors.error}22`,
              transform: [{ scale: cardScale }],
              opacity: cardOpacity,
            },
          ]}
        >
          {/* Close pill */}
          <Pressable
            onPress={handleCancel}
            disabled={deleting}
            hitSlop={12}
            style={[
              styles.closeBtn,
              { backgroundColor: `${colors.text}12` },
            ]}
          >
            <X size={14} color={colors.text} strokeWidth={2.5} />
          </Pressable>

          {/* Icon badge */}
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: `${colors.error}14` },
            ]}
          >
            <AlertTriangle
              size={28}
              color={colors.error}
              strokeWidth={2}
              fill={`${colors.error}20`}
            />
          </View>

          {/* Copy */}
          <Text style={[styles.title, { color: colors.text }]}>
            Remover item
          </Text>

          <Text style={[styles.body, { color: colors.text }]}>
            Deseja remover{" "}
            <Text style={[styles.productName, { color: colors.text }]}>
              "{productName}"
            </Text>
            ?{"\n"}
            Esta ação não pode ser desfeita.
          </Text>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: `${colors.border}18` },
            ]}
          />

          {/* Actions */}
          <View style={styles.actions}>
            {/* Cancelar */}
            <Pressable
              onPress={handleCancel}
              disabled={deleting}
              style={({ pressed }) => [
                styles.cancelBtn,
                {
                  backgroundColor: `${colors.text}10`,
                  borderColor:     `${colors.border}20`,
                  opacity: pressed || deleting ? 0.6 : 1,
                },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>
                Cancelar
              </Text>
            </Pressable>

            {/* Confirmar */}
            <Pressable
              onPress={handleConfirm}
              disabled={deleting}
              style={({ pressed }) => [
                styles.confirmWrap,
                { opacity: pressed || deleting ? 0.7 : 1 },
              ]}
            >
              <LinearGradient
                colors={[`${colors.error}EE`, `${colors.error}BB`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmBtn}
              >
                <Trash2 size={15} color="#fff" strokeWidth={2.5} />
                <Text style={styles.confirmText}>
                  {deleting ? "Removendo…" : "Sim, remover"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    // Android
    elevation: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.1,
    marginBottom: 8,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20,
  },
  productName: {
    fontWeight: "600",
  },
  divider: {
    width: "100%",
    height: 1,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  confirmWrap: {
    flex: 1.4,
    borderRadius: 16,
    overflow: "hidden",
  },
  confirmBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});