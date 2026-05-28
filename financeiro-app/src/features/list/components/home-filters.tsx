import { View, StyleSheet } from "react-native";
import { Package, Clock3, Check } from "lucide-react-native";
import { FilterChip } from "@/components/ui/filter-chips";
import { useTheme } from "@/context/theme.context";
import type { StatusFilter } from "../constants/home.constants";

type Props = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

export function HomeFilters({ value, onChange }: Props) {
  const { colors: theme } = useTheme();

  return (
    <View style={styles.container}>
      <FilterChip
        label="Todos"
        icon={Package}
        active={value === "todos"}
        onPress={() => onChange("todos")}
        activeColor={theme.fabGradientStart}
        inactiveColor={theme.card}
        textColor={value === "todos" ? "#ffffff" : theme.text}
      />

      <FilterChip
        label="Pendentes"
        icon={Clock3}
        active={value === "pendente"}
        onPress={() => onChange("pendente")}
        activeColor="#f59e0b"
        inactiveColor={theme.card}
        textColor={value === "pendente" ? "#ffffff" : theme.text}
      />

      <FilterChip
        label="Finalizados"
        icon={Check}
        active={value === "finalizado"}
        onPress={() => onChange("finalizado")}
        activeColor="#22c55e"
        inactiveColor={theme.card}
        textColor={value === "finalizado" ? "#ffffff" : theme.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
});