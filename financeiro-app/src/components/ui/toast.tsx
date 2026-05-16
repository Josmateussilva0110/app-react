import { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";
import { CheckCircle, XCircle, Info } from "lucide-react-native";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
}

const CONFIG: Record<ToastType, { color: string; Icon: typeof CheckCircle }> = {
  success: { color: "#22c55e", Icon: CheckCircle },
  error:   { color: "#ef4444", Icon: XCircle },
  info:    { color: "#3b82f6", Icon: Info },
};

export function Toast({
  visible,
  type = "info",
  title,
  message,
  duration = 3000,
  onHide,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const { color, Icon } = CONFIG[type];

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onHide);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Icon size={20} color={color} />
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
      <View style={[styles.bar, { backgroundColor: color }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute", top: 60, left: 16, right: 16, zIndex: 999,
    backgroundColor: "#1a1a1a", borderRadius: 12, borderWidth: 1,
    borderColor: "#2a2a2a", padding: 14, flexDirection: "row",
    alignItems: "center", gap: 12, overflow: "hidden",
  },
  texts:   { flex: 1, gap: 2 },
  title:   { color: "#fff", fontSize: 14, fontWeight: "600" },
  message: { color: "#9ca3af", fontSize: 13 },
  bar:     { position: "absolute", bottom: 0, left: 0, right: 0, height: 3 },
});
