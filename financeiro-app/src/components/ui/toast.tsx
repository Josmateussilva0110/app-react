import { useEffect, useRef } from "react";

import {
  Animated,
  Text,
  StyleSheet,
  View,
} from "react-native";

import {
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react-native";

type ToastType =
  | "success"
  | "error"
  | "info";

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
}

const CONFIG: Record<
  ToastType,
  {
    color: string;
    Icon: typeof CheckCircle;
  }
> = {
  success: {
    color: "#22c55e",
    Icon: CheckCircle,
  },

  error: {
    color: "#ef4444",
    Icon: XCircle,
  },

  info: {
    color: "#3b82f6",
    Icon: Info,
  },
};

export function Toast({
  visible,
  type = "info",
  title,
  message,
  duration = 3000,
  onHide,
}: ToastProps) {
  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateY = useRef(
    new Animated.Value(-20)
  ).current;

  const { color, Icon } = CONFIG[type];

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(duration),

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: -20,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start(onHide);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [
            {
              translateY,
            },
          ],
        },
      ]}
    >
      <Icon
        size={18}
        color={color}
      />

      <View style={styles.texts}>
        <Text
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </Text>

        {!!message && (
          <Text
            numberOfLines={1}
            style={styles.message}
          >
            {message}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.bar,
          {
            backgroundColor: color,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",

    top: 60,
    right: 16,

    width: 260,

    zIndex: 999,

    backgroundColor: "#18181B",

    borderRadius: 14,

    borderWidth: 1,
    borderColor: "#27272A",

    paddingHorizontal: 14,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 10,
  },

  texts: {
    flex: 1,
  },

  title: {
    color: "#fff",

    fontSize: 13,
    fontWeight: "700",
  },

  message: {
    marginTop: 2,

    color: "#A1A1AA",

    fontSize: 11,
  },

  bar: {
    position: "absolute",

    left: 0,
    bottom: 0,

    width: "100%",
    height: 2,
  },
});
