import { useEffect, useRef } from "react";

import {
  Animated,
  Text,
  StyleSheet,
  View,
} from "react-native";

import {
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react-native";

import { BlurView } from "expo-blur";

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
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    color: "#22c55e",
    Icon: CheckCircle2,
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
    new Animated.Value(-30)
  ).current;

  const scale = useRef(
    new Animated.Value(0.96)
  ).current;

  const { color, Icon } = CONFIG[type];

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 180,
        }),

        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 180,
        }),

        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(duration),

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: -20,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.timing(scale, {
          toValue: 0.96,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start(onHide);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      <BlurView
        intensity={35}
        tint="dark"
        style={styles.container}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${color}20`,
            },
          ]}
        >
          <Icon
            size={18}
            color={color}
          />
        </View>

        <View style={styles.texts}>
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Text>

          {!!message && (
            <Text
              numberOfLines={2}
              style={styles.message}
            >
              {message}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.indicator,
            {
              backgroundColor: color,
            },
          ]}
        />
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",

    top: 64,
    left: 16,
    right: 16,

    zIndex: 999,
  },

  container: {
    overflow: "hidden",

    borderRadius: 22,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    backgroundColor: "rgba(24,24,27,0.85)",

    paddingVertical: 14,
    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.18,

    shadowRadius: 20,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 10,
  },

  iconContainer: {
    width: 38,
    height: 38,

    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",
  },

  texts: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 14,
    fontWeight: "700",

    letterSpacing: 0.2,
  },

  message: {
    marginTop: 3,

    color: "#A1A1AA",

    fontSize: 12,

    lineHeight: 18,
  },

  indicator: {
    width: 4,
    alignSelf: "stretch",

    borderRadius: 99,
  },
});
