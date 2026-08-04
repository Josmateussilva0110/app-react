import { useMemo, useState } from "react";
import { View, Text, StyleSheet, type LayoutChangeEvent } from "react-native";
import Svg, {
  Polyline,
  Circle,
  Line,
  G,
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

const BASE_HEIGHT = 200;
const PAD_BOTTOM = 28;
const PAD_X = 12;
const LABEL_LINE_HEIGHT = 10;
const CLUSTER_PX = 20;
const CHART_MARGIN = 4;

type ChartPoint = {
  key: string;
  monthIndex: number;
  cx: number;
  cy: number;
  value: number;
  color: string;
  label: string;
};

type LabelLayout = {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  fontSize: number;
};

function estimateLabelHalfWidth(text: string, fontSize: number): number {
  return Math.max(16, text.length * fontSize * 0.5);
}

function clampLabelX(
  cx: number,
  halfWidth: number,
  chartWidth: number
): Pick<LabelLayout, "x" | "anchor"> {
  const minX = CHART_MARGIN + halfWidth;
  const maxX = chartWidth - CHART_MARGIN - halfWidth;

  if (chartWidth <= halfWidth * 2 + CHART_MARGIN * 2) {
    return { x: chartWidth / 2, anchor: "middle" };
  }
  if (cx < minX) {
    return { x: CHART_MARGIN, anchor: "start" };
  }
  if (cx > maxX) {
    return { x: chartWidth - CHART_MARGIN, anchor: "end" };
  }
  return { x: cx, anchor: "middle" };
}

function clampLabelYs(labelYs: number[], minY: number, maxY: number): number[] {
  if (labelYs.length === 0) return labelYs;

  let ys = [...labelYs];

  if (ys[0] < minY) {
    const shift = minY - ys[0];
    ys = ys.map((y) => y + shift);
  }
  if (ys[ys.length - 1] > maxY) {
    const shift = ys[ys.length - 1] - maxY;
    ys = ys.map((y) => y - shift);
  }

  if (ys.length > 1 && (ys[0] < minY || ys[ys.length - 1] > maxY)) {
    const span = Math.max(maxY - minY, 0);
    const gap = span / Math.max(ys.length - 1, 1);
    ys = ys.map((_, i) => minY + i * gap);
  }

  return ys.map((y) => Math.min(maxY, Math.max(minY, y)));
}

function defaultLabelY(pointY: number, plotTop: number, plotBottom: number): number {
  const minY = plotTop + LABEL_LINE_HEIGHT;
  const maxY = plotBottom - LABEL_LINE_HEIGHT;

  if (pointY <= minY + 4) return Math.min(pointY + 12, maxY);
  if (pointY >= maxY - 4) return Math.max(pointY - 10, minY);
  return Math.max(minY, pointY - 6);
}

function resolveColumnLabelYs(
  points: ChartPoint[],
  plotTop: number,
  plotBottom: number,
  gap: number
): Map<string, number> {
  const result = new Map<string, number>();
  if (points.length === 0) return result;

  const minY = plotTop + LABEL_LINE_HEIGHT;
  const maxY = plotBottom - LABEL_LINE_HEIGHT;
  const sorted = [...points].sort((a, b) => a.cy - b.cy);
  const cySpread = sorted[sorted.length - 1].cy - sorted[0].cy;

  let labelYs: number[];

  if (points.length === 1) {
    labelYs = [defaultLabelY(sorted[0].cy, plotTop, plotBottom)];
  } else if (cySpread <= CLUSTER_PX) {
    const stackHeight = (points.length - 1) * gap;
    const anchorY = Math.min(...sorted.map((p) => p.cy));
    const idealStart = anchorY - 8 - stackHeight;
    labelYs = sorted.map((_, i) => idealStart + i * gap);
  } else {
    labelYs = sorted.map((p) => defaultLabelY(p.cy, plotTop, plotBottom));
    for (let i = 1; i < labelYs.length; i++) {
      if (labelYs[i] - labelYs[i - 1] < gap) {
        labelYs[i] = labelYs[i - 1] + gap;
      }
    }
  }

  if (labelYs[labelYs.length - 1] > maxY || labelYs[0] < minY) {
    labelYs = sorted.map((p, i) => (i % 2 === 0 ? p.cy - 8 : p.cy + 12));
    for (let i = 1; i < labelYs.length; i++) {
      if (labelYs[i] - labelYs[i - 1] < gap) {
        labelYs[i] = labelYs[i - 1] + gap;
      }
    }
  }

  labelYs = clampLabelYs(labelYs, minY, maxY);
  sorted.forEach((p, i) => result.set(p.key, labelYs[i]));
  return result;
}

function buildLabelLayouts(
  points: ChartPoint[],
  chartWidth: number,
  plotTop: number,
  plotBottom: number,
  fontSize: number
): Map<string, LabelLayout> {
  const byMonth = new Map<number, ChartPoint[]>();
  for (const point of points) {
    const group = byMonth.get(point.monthIndex) ?? [];
    group.push(point);
    byMonth.set(point.monthIndex, group);
  }

  const gap = Math.max(8, Math.min(LABEL_LINE_HEIGHT + 1, (plotBottom - plotTop) / 8));
  const yPositions = new Map<string, number>();

  for (const group of byMonth.values()) {
    const columnPositions = resolveColumnLabelYs(group, plotTop, plotBottom, gap);
    columnPositions.forEach((y, key) => yPositions.set(key, y));
  }

  const layouts = new Map<string, LabelLayout>();
  for (const point of points) {
    const halfWidth = estimateLabelHalfWidth(point.label, fontSize);
    const { x, anchor } = clampLabelX(point.cx, halfWidth, chartWidth);
    layouts.set(point.key, {
      x,
      y: yPositions.get(point.key) ?? defaultLabelY(point.cy, plotTop, plotBottom),
      anchor,
      fontSize,
    });
  }

  return layouts;
}

function clampMonthLabelX(
  cx: number,
  chartWidth: number,
  fontSize: number
): Pick<LabelLayout, "x" | "anchor"> {
  const halfWidth = fontSize * 1.6;
  return clampLabelX(cx, halfWidth, chartWidth);
}

export function EvolutionLineChart({ months, series, average }: EvolutionLineChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const n = months.length;
  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(1, ...allValues, average > 0 ? average : 0);

  const maxLabelsPerMonth = useMemo(() => {
    const counts = new Map<number, number>();
    for (const s of series) {
      s.data.forEach((v, i) => {
        if (v > 0) counts.set(i, (counts.get(i) ?? 0) + 1);
      });
    }
    return Math.max(1, ...counts.values());
  }, [series]);

  const labelFontSize = width > 0 && width < 340 ? 7 : 8;
  const extraTop = Math.max(0, (maxLabelsPerMonth - 1) * 12);
  const height = BASE_HEIGHT + extraTop;
  const padTop = 24 + extraTop;

  const plotW = Math.max(0, width - PAD_X * 2);
  const plotH = height - padTop - PAD_BOTTOM;
  const xStep = n > 1 ? plotW / (n - 1) : 0;
  const plotBottom = padTop + plotH;

  const x = (i: number) => PAD_X + i * xStep;
  const y = (v: number) => padTop + (1 - v / maxVal) * plotH;

  const chartPoints = useMemo(() => {
    const points: ChartPoint[] = [];
    for (const s of series) {
      s.data.forEach((v, i) => {
        if (v <= 0) return;
        points.push({
          key: `${s.userName}-${i}`,
          monthIndex: i,
          cx: PAD_X + i * xStep,
          cy: padTop + (1 - v / maxVal) * plotH,
          value: v,
          color: s.color,
          label: formatBRLChart(v),
        });
      });
    }
    return points;
  }, [series, xStep, maxVal, padTop, plotH]);

  const labelLayouts = useMemo(
    () =>
      width > 0
        ? buildLabelLayouts(chartPoints, width, padTop, plotBottom, labelFontSize)
        : new Map<string, LabelLayout>(),
    [chartPoints, width, padTop, plotBottom, labelFontSize]
  );

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

      <View onLayout={onLayout} style={[styles.chartWrap, { height }]}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Line
              x1={PAD_X}
              y1={plotBottom}
              x2={PAD_X + plotW}
              y2={plotBottom}
              stroke={colors.border}
              strokeWidth={1}
            />

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

            {chartPoints.map((point) => {
              const layout =
                labelLayouts.get(point.key) ??
                ({
                  x: point.cx,
                  y: defaultLabelY(point.cy, padTop, plotBottom),
                  anchor: "middle",
                  fontSize: labelFontSize,
                } satisfies LabelLayout);

              return (
                <G key={point.key}>
                  <Circle cx={point.cx} cy={point.cy} r={2.5} fill={point.color} />
                  <SvgText
                    x={layout.x}
                    y={layout.y}
                    fill={point.color}
                    fontSize={layout.fontSize}
                    fontWeight="600"
                    textAnchor={layout.anchor}
                  >
                    {point.label}
                  </SvgText>
                </G>
              );
            })}

            {months.map((m, i) => {
              const cx = x(i);
              const monthLayout = clampMonthLabelX(cx, width, 9);
              return (
                <SvgText
                  key={`${m}-${i}`}
                  x={monthLayout.x}
                  y={height - 8}
                  fill={colors.textSecondary}
                  fontSize={9}
                  textAnchor={monthLayout.anchor}
                >
                  {MONTHS_ABBR[m - 1]}
                </SvgText>
              );
            })}
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
  chartWrap: {
    overflow: "hidden",
  },
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
