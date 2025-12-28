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
  onPressMonth?: (month: string, total: number) => void;
  onPressMood?: (month: string, mood: Mood, count: number) => void;
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
    const paddingX = theme.spacing.md;
    const paddingTop = theme.spacing.md;
    const rootY = paddingTop + 18;
    const rootX = width / 2;

    const cols = 3;
    const rows = 4;
    const colW = (width - paddingX * 2) / cols;
    const monthStartY = rootY + 64;
    const rowH = 150;

    const monthPositions: Record<string, {x: number; y: number}> = {};
    months.forEach((m, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      monthPositions[m] = {
        x: paddingX + c * colW + colW / 2,
        y: monthStartY + r * rowH,
      };
    });

    const height = monthStartY + rows * rowH + 40;
    return {rootX, rootY, monthPositions, height, colW};
  }, [months, theme.spacing.md, width]);

  const $canvas: ViewStyle = {
    width: "100%",
    height: layout.height,
  };

  const $rootNode: ViewStyle = {
    position: "absolute",
    left: layout.rootX - 34,
    top: layout.rootY - 34,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.soft,
  };

  const $rootText: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    letterSpacing: 0.4,
  };

  const $monthNodeBase: ViewStyle = {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.soft,
  };

  const $monthText: TextStyle = {
    fontSize: theme.typography.micro,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  };

  const $moodNodeBase: ViewStyle = {
    position: "absolute",
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  };

  const $moodLabel: TextStyle = {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.textPrimary,
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

    // Root -> month line
    lines.push(
      <View
        key={`line-root-${month}`}
        style={makeLineStyle(
          layout.rootX,
          layout.rootY + 34,
          pos.x,
          pos.y - 23,
          theme.colors.borderSoft
        )}
      />
    );

    // Month node
    nodes.push(
      <Pressable
        key={`month-${month}`}
        accessibilityRole="button"
        accessibilityLabel={`${formatMonthLabel(month)} total ${total}`}
        onPress={() => onPressMonth?.(month, total)}
        style={({pressed}) => [
          $monthNodeBase,
          {
            left: pos.x - 23,
            top: pos.y - 23,
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        <Text style={$monthText}>{formatMonthLabel(month)}</Text>
      </Pressable>
    );

    // Mood child nodes (stacked)
    const maxVisible = 6; // keep it readable; remaining collapsed into +N
    const visible = moodEntries.slice(0, maxVisible);
    const remaining = moodEntries.slice(maxVisible);

    const moodStartY = pos.y + 46;
    const spacingY = 28;

    visible.forEach((item, idx) => {
      const size = clamp(12 + item.count * 2, 14, 26);
      const x = pos.x;
      const y = moodStartY + idx * spacingY;
      const meta = MOOD_META[item.mood];
      const bg = theme.colors[meta.colorKey];

      lines.push(
        <View
          key={`line-${month}-${item.mood}`}
          style={makeLineStyle(
            pos.x,
            pos.y + 23,
            x,
            y - size / 2,
            theme.colors.borderSoft
          )}
        />
      );

      nodes.push(
        <Pressable
          key={`mood-${month}-${item.mood}`}
          accessibilityRole="button"
          accessibilityLabel={`${formatMonthLabel(month)} ${meta.label} ${item.count}`}
          onPress={() => onPressMood?.(month, item.mood, item.count)}
          style={({pressed}) => [
            $moodNodeBase,
            {
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: bg,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Text style={$moodLabel}>{meta.label.slice(0, 1)}</Text>
        </Pressable>
      );
    });

    if (remaining.length > 0) {
      const countHidden = remaining.length;
      const size = 18;
      const x = pos.x;
      const y = moodStartY + visible.length * spacingY;

      nodes.push(
        <View
          key={`mood-more-${month}`}
          style={[
            $moodNodeBase,
            {
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.colors.bgSubtle,
            },
          ]}
        >
          <Text style={[$moodLabel, {color: theme.colors.textSecondary}]}>
            +{countHidden}
          </Text>
        </View>
      );
    }
  });

  return (
    <View style={$canvas}>
      {lines}
      <View style={$rootNode} accessibilityLabel={`Year ${year}`}>
        <Text style={$rootText}>{year}</Text>
      </View>
      {nodes}
    </View>
  );
}


