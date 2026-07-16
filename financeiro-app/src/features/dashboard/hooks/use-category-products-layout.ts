export type LayoutScale = {
  padding: number;
  gap: number;
  summaryPadding: number;
  iconSize: number;
  iconWrap: number;
  summaryLabel: number;
  summaryValue: number;
  headerPadH: number;
  headerPadV: number;
  rowPadH: number;
  rowPadV: number;
  nameSize: number;
  userSize: number;
  cellSize: number;
  headerSize: number;
  dateWidth: number;
  valueWidth: number;
  statusWidth: number;
  statusIcon: number;
  useStacked: boolean;
};

export function useCategoryProductsLayout(width: number): LayoutScale {
  const isCompact = width < 360;
  const isNarrow = width < 400;
  const isTablet = width >= 480;

  return {
    padding: isCompact ? 12 : isTablet ? 24 : 16,
    gap: isCompact ? 12 : 16,
    summaryPadding: isCompact ? 12 : 14,
    iconSize: isCompact ? 16 : 18,
    iconWrap: isCompact ? 32 : 36,
    summaryLabel: isCompact ? 11 : 12,
    summaryValue: isCompact ? 18 : isTablet ? 22 : 20,
    headerPadH: isCompact ? 10 : 14,
    headerPadV: isCompact ? 8 : 10,
    rowPadH: isCompact ? 10 : 14,
    rowPadV: isCompact ? 10 : 12,
    nameSize: isCompact ? 12 : 13,
    userSize: isCompact ? 10 : 11,
    cellSize: isCompact ? 11 : 12,
    headerSize: isCompact ? 10 : 11,
    dateWidth: isCompact ? 58 : isNarrow ? 62 : 68,
    valueWidth: isCompact ? 68 : isNarrow ? 74 : 82,
    statusWidth: isNarrow ? 88 : 96,
    statusIcon: isCompact ? 14 : 16,
    useStacked: width < 400,
  };
}
