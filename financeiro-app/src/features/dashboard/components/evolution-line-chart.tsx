import { useState } from "react";
import { View, Text, StyleSheet, type LayoutChangeEvent } from "react-native";
import Svg, {
  Polyline,
  Circle,
  Line,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "@/context/theme.context";
import { MONTHS_ABBR, formatBRLChart } from "../constants";

export type EvolutionSeriesUI = {
  userName: string;
  color: string;
  data: number[]; // alinhado com `months`
};

type EvolutionLineChartProps = {
  months: number[]; // 1-12
  series: EvolutionSeriesUI[];
  average: number;
};

const HEIGHT = 200;
const PAD_TOP = 14;
const PAD_BOTTOM = 24;
const PAD_X = 10;

export function EvolutionLineChart({ months, series, average }: EvolutionLineChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const n = months.length;
  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(1, ...allValues, average > 0 ? average : 0);

  const plotW = Math.max(0, width - PAD_X * 2);
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const xStep = n > 1 ? plotW / (n - 1) : 0;

  const x = (i: number) => PAD_X + i * xStep;
  const y = (v: number) => PAD_TOP + (1 - v / maxVal) * plotH;

  const hasData = series.some((s) => s.data.some((v) => v > 0));

  return (
    <View>
      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.userName} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {s.userName || "—"}
            </Text>
          </View>
        ))}
        {average > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.dashDot, { borderColor: colors.warning }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Média ({formatBRLChart(average)})
            </Text>
          </View>
        )}
      </View>

      <View onLayout={onLayout} style={{ height: HEIGHT }}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {/* baseline */}
            <Line
              x1={PAD_X}
              y1={PAD_TOP + plotH}
              x2={PAD_X + plotW}
              y2={PAD_TOP + plotH}
              stroke={colors.border}
              strokeWidth={1}
            />

            {/* média de gastos */}
            {average > 0 && average <= maxVal && (
              <Line
                x1={PAD_X}
                y1={y(average)}
                x2={PAD_X + plotW}
                y2={y(average)}
                stroke={colors.warning}
                strokeWidth={1.5}
                strokeDasharray="6 5"
              />
            )}

            {/* séries */}
            {series.map((s) => (
              <Polyline
                key={s.userName}
                points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* pontos */}
            {series.map((s) =>
              s.data.map((v, i) => (
                <Circle key={`${s.userName}-${i}`} cx={x(i)} cy={y(v)} r={2.5} fill={s.color} />
              ))
            )}

            {/* rótulos dos meses */}
            {months.map((m, i) => (
              <SvgText
                key={m}
                x={x(i)}
                y={HEIGHT - 8}
                fill={colors.textSecondary}
                fontSize={9}
                textAnchor="middle"
              >
                {MONTHS_ABBR[m - 1]}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>

      <Text style={[styles.caption, { color: colors.textSecondary }]}>
        Topo do gráfico ≈ {formatBRLChart(maxVal)}
        {!hasData ? " · sem lançamentos no ano" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dashDot: {
    width: 12,
    height: 0,
    borderTopWidth: 2,
    borderStyle: "dashed",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  caption: {
    fontSize: 11,
    marginTop: 8,
  },
});
