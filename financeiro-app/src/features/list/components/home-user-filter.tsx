import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Users } from "lucide-react-native";
import { FilterChip } from "@/components/ui/filter-chips";
import { useTheme } from "@/context/theme.context";

export const ALL_USERS_VALUE = "todos";

type MemberOption = {
  id: string;
  name: string;
};

type Props = {
  members: MemberOption[];
  value: string;
  onChange: (value: string) => void;
};

export function HomeUserFilter({ members, value, onChange }: Props) {
  const { colors: theme } = useTheme();

  const users = useMemo(() => members, [members]);

  if (users.length <= 1 && value === ALL_USERS_VALUE) return null;

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
