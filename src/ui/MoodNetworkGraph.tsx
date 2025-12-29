import React, {useMemo} from "react";
import {Pressable, Text, TextStyle, View, ViewStyle} from "react-native";
import {useWindowDimensions} from "react-native";
import type {Mood} from "../data/types";
import {useTheme} from "../theme/ThemeProvider";

type MoodColorKey =
  | "tagCalm"
  | "tagHappy"
  | "tagReflective"
  | "tagStressed"
  | "tagGrateful"
  | "tagEnergized"
  | "tagFocused"
  | "tagSad";

const MOOD_META: Record<Mood, {label: string; colorKey: MoodColorKey}> = {
  calm: {label: "Calm", colorKey: "tagCalm"},
  happy: {label: "Happy", colorKey: "tagHappy"},
  reflective: {label: "Reflective", colorKey: "tagReflective"},
  stressed: {label: "Stressed", colorKey: "tagStressed"},
  grateful: {label: "Grateful", colorKey: "tagGrateful"},
  energized: {label: "Energized", colorKey: "tagEnergized"},
  focused: {label: "Focused", colorKey: "tagFocused"},
  sad: {label: "Sad", colorKey: "tagSad"},
};

export interface YearMoodCounts {
  [month: string]: Partial<Record<Mood, number>>; // month: "01".."12"
}

interface MoodNetworkGraphProps {
  year: string;
  data: YearMoodCounts;
  onPressMonth?: (month: string, total: number, breakdown: {mood: Mood; count: number}[]) => void;
  onPressMood?: (month: string, mood: Mood, count: number) => void;
  legendPosition?: "top" | "bottom";
}

function formatMonthLabel(month: string): string {
  const map: Record<string, string> = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };
  return map[month] ?? month;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function makeLineStyle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
): ViewStyle {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    position: "absolute",
    left: x1,
    top: y1,
    width: length,
    height: 2,
    backgroundColor: color,
    transform: [{rotate: `${angle}deg`}],
    transformOrigin: "0% 50%",
    borderRadius: 1,
    opacity: 0.7,
  } as any;
}

export function MoodNetworkGraph({
  year,
  data,
  onPressMonth,
  onPressMood,
  legendPosition = "bottom",
}: MoodNetworkGraphProps) {
  const theme = useTheme();
  const {width} = useWindowDimensions();

  const months = useMemo(
    () =>
      [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
      ] as const,
    []
  );

  const layout = useMemo(() => {
    const rootX = width / 2;
    const rootY = 80;
    const ringCenterY = 220;
    const radius = Math.min(width * 0.38, 180);

    const monthPositions: Record<string, {x: number; y: number}> = {};
    months.forEach((m, i) => {
      const angle = (2 * Math.PI * i) / months.length - Math.PI / 2; // start at top
      monthPositions[m] = {
        x: rootX + radius * Math.cos(angle),
        y: ringCenterY + radius * Math.sin(angle),
      };
    });

    const height = ringCenterY + radius + 80;
    return {rootX, rootY, ringCenterY, radius, monthPositions, height};
  }, [months, width]);

  const $canvas: ViewStyle = {
    width: "100%",
    height: layout.height,
  };

  const $rootNode: ViewStyle = {
    position: "absolute",
    left: layout.rootX - 36,
    top: layout.rootY - 36,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1.5,
    borderColor: theme.colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.medium,
  };

  const $rootText: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    letterSpacing: 0.4,
  };

  const $monthNodeBase: ViewStyle = {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1.25,
    borderColor: theme.colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.soft,
    overflow: "hidden",
  };

  const $monthText: TextStyle = {
    fontSize: theme.typography.small,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  };

  const $legendRow: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  };

  const $legendItem: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  };

  const $legendDot: ViewStyle = {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  };

  const $legendText: TextStyle = {
    fontSize: theme.typography.micro,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    letterSpacing: 0.2,
  };

  const lines: React.ReactNode[] = [];
  const nodes: React.ReactNode[] = [];

  months.forEach((month) => {
    const pos = layout.monthPositions[month];
    const moodCounts = data[month] ?? {};
    const moodEntries = (Object.keys(moodCounts) as Mood[])
      .map((m) => ({mood: m, count: moodCounts[m] ?? 0}))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);

    const total = moodEntries.reduce((sum, x) => sum + x.count, 0);
    const opacity = total === 0 ? 0.35 : 1;

    // Root -> month line
    lines.push(
      <View
        key={`line-root-${month}`}
        style={makeLineStyle(
          layout.rootX,
          layout.rootY + 36,
          pos.x,
          pos.y - 32,
          theme.colors.borderSoft
        )}
      />
    );

    // Month node (single, stacked fill)
    nodes.push(
      <Pressable
        key={`month-${month}`}
        accessibilityRole="button"
        accessibilityLabel={`${formatMonthLabel(month)} total ${total}`}
        onPress={() => onPressMonth?.(month, total, moodEntries)}
        style={({pressed}) => [
          $monthNodeBase,
          {
            left: pos.x - 38,
            top: pos.y - 38,
            opacity: pressed ? 0.75 : opacity,
          },
        ]}
      >
        {total > 0 && (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 22,
              overflow: "hidden",
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 0,
              flexDirection: "row",
            }}
          >
            {moodEntries.map((item) => {
              const meta = MOOD_META[item.mood];
              const pct = total > 0 ? item.count / total : 0;
              const widthPct = `${Math.max(pct * 100, 8)}%`; // min width for visibility
              return (
                <View
                  key={`${month}-${item.mood}`}
                  style={{
                    width: widthPct,
                    backgroundColor: theme.colors[meta.colorKey],
                    opacity: 1,
                  }}
                />
              );
            })}
          </View>
        )}

        <Text style={$monthText}>{formatMonthLabel(month)}</Text>
        <Text
          style={{
            fontSize: theme.typography.micro,
            fontWeight: "700",
            color: theme.colors.textPrimary,
            marginTop: 2,
          }}
        >
          {total}
        </Text>
      </Pressable>
    );
  });

  const legend = (Object.keys(MOOD_META) as Mood[]).map((mood) => {
    const meta = MOOD_META[mood];
    return (
      <View key={mood} style={$legendItem}>
        <View style={[$legendDot, {backgroundColor: theme.colors[meta.colorKey]}]} />
        <Text style={$legendText}>{meta.label}</Text>
      </View>
    );
  });

  return (
    <View>
      {legendPosition === "top" && <View style={$legendRow}>{legend}</View>}
      <View style={$canvas}>
        {lines}
        <View style={$rootNode} accessibilityLabel={`Year ${year}`}>
          <Text style={$rootText}>{year}</Text>
        </View>
        {nodes}
      </View>
      {legendPosition === "bottom" && <View style={$legendRow}>{legend}</View>}
    </View>
  );
}




