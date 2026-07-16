import { ScrollView, StyleSheet } from "react-native";
import { ListChecks, ListX, Package } from "lucide-react-native";
import { FilterChip } from "@/components/ui/filter-chips";
import { useTheme } from "@/context/theme.context";
import type { MonthListFilter } from "../constants/dashboard-filters";

type Props = {
  value: MonthListFilter;
  onChange: (value: MonthListFilter) => void;
};

export function MonthListFilters({ value, onChange }: Props) {
  const { colors: theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
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
        label="Lista do mês"
        icon={ListChecks}
        active={value === "sim"}
        onPress={() => onChange("sim")}
        activeColor={theme.primary}
        inactiveColor={theme.card}
        textColor={value === "sim" ? "#ffffff" : theme.text}
      />

      <FilterChip
        label="Fora da lista"
        icon={ListX}
        active={value === "nao"}
        onPress={() => onChange("nao")}
        activeColor="#64748b"
        inactiveColor={theme.card}
        textColor={value === "nao" ? "#ffffff" : theme.text}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 4,
  },
});
