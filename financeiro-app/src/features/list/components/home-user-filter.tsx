// src/features/list/components/home-user-filter.tsx
import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Users } from "lucide-react-native";
import { FilterChip } from "@/components/ui/filter-chips";
import { useTheme } from "@/context/theme.context";
import type { ProductResponse } from "@app/shared";

export const ALL_USERS_VALUE = "todos";

type Props = {
  products: ProductResponse[];
  value: string;
  onChange: (value: string) => void;
};

export function HomeUserFilter({ products, value, onChange }: Props) {
  const { colors: theme } = useTheme();

  const users = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.user_id && !map.has(p.user_id)) {
        map.set(p.user_id, p.user_name ?? "Usuário");
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [products]);

  if (users.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <FilterChip
        label="Todos"
        icon={Users}
        active={value === ALL_USERS_VALUE}
        onPress={() => onChange(ALL_USERS_VALUE)}
        activeColor={theme.fabGradientStart}
        inactiveColor={theme.card}
        textColor={value === ALL_USERS_VALUE ? "#ffffff" : theme.text}
      />
      {users.map((user) => (
        <FilterChip
          key={user.id}
          label={user.name}
          icon={Users}
          active={value === user.id}
          onPress={() => onChange(user.id)}
          activeColor={theme.fabGradientStart}
          inactiveColor={theme.card}
          textColor={value === user.id ? "#ffffff" : theme.text}
        />
      ))}
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