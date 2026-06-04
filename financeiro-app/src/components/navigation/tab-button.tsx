import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

interface Props {
  label: string;
  focused: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}

export function TabButton({
  label,
  focused,
  icon,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {icon}

      {label !== "" && (
        <Text
          style={[
            styles.label,
            focused &&
              styles.labelActive,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    color: "#71717A",
  },

  labelActive: {
    color: "#22C55E",
  },
});