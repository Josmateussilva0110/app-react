import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import type { EnrichedProduct } from "@/hooks/use-products";

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

type Props = {
  products: EnrichedProduct[];
  month: number | null;
  year: number | null;
  onChange: (month: number | null, year: number | null) => void;
  serverFiltered?: boolean;
};

export function HomeMonthYearFilter({
  products,
  month,
  year,
  onChange,
  serverFiltered = false,
}: Props) {
  const { colors: theme } = useTheme();
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const fromProducts = new Set<number>();

    if (!serverFiltered) {
      for (const product of products) {
        if (product._year != null) {
          fromProducts.add(product._year);
        }
      }
    }

    for (let y = current - 3; y <= current; y += 1) fromProducts.add(y);
    if (year !== null) fromProducts.add(year);
    return Array.from(fromProducts).sort((a, b) => b - a);
  }, [products, year, serverFiltered]);

  const months = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Mês</Text>
        <Pressable
          onPress={() => setMonthMenuOpen(true)}
          style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={[styles.selectorText, { color: theme.text }]}>
            {month === null ? "Todos" : MONTH_LABELS[month]}
          </Text>
          <ChevronDown size={16} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Ano</Text>
        <Pressable
          onPress={() => setYearMenuOpen(true)}
          style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={[styles.selectorText, { color: theme.text }]}>
            {year === null ? "Todos" : String(year)}
          </Text>
          <ChevronDown size={16} color={theme.textSecondary} />
        </Pressable>
      </View>

      <Modal transparent visible={monthMenuOpen} animationType="fade" onRequestClose={() => setMonthMenuOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setMonthMenuOpen(false)}>
          <View style={[styles.menu, { backgroundColor: theme.card, borderColor: theme.border }]}> 
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                onChange(null, year);
                setMonthMenuOpen(false);
              }}
            >
              <Text style={[styles.menuText, { color: theme.text }]}>Todos</Text>
            </Pressable>

            {months.map((m) => (
              <Pressable
                key={String(m)}
                style={styles.menuItem}
                onPress={() => {
                  onChange(month === m ? null : m, year);
                  setMonthMenuOpen(false);
                }}
              >
                <Text style={[styles.menuText, { color: theme.text }]}>{MONTH_LABELS[m]}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={yearMenuOpen} animationType="fade" onRequestClose={() => setYearMenuOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setYearMenuOpen(false)}>
          <View style={[styles.menu, { backgroundColor: theme.card, borderColor: theme.border }]}> 
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                onChange(month, null);
                setYearMenuOpen(false);
              }}
            >
              <Text style={[styles.menuText, { color: theme.text }]}>Todos</Text>
            </Pressable>

            {years.map((y) => (
              <Pressable
                key={String(y)}
                style={styles.menuItem}
                onPress={() => {
                  onChange(month, year === y ? null : y);
                  setYearMenuOpen(false);
                }}
              >
                <Text style={[styles.menuText, { color: theme.text }]}>{String(y)}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 20,
  },
  menu: {
    width: "100%",
    maxWidth: 240,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
