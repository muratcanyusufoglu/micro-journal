import React, {useEffect, useMemo, useState} from "react";
import {ActivityIndicator, Pressable, ScrollView, Text, TextStyle, View, ViewStyle} from "react-native";
import {router} from "expo-router";
import {useTheme} from "../src/theme/ThemeProvider";
import {getYearMoodCounts, listYearsWithMood} from "../src/data";
import type {Mood, YearMoodCountRow} from "../src/data/types";
import {AppHeader, MoodNetworkGraph, Screen, useToast} from "../src/ui";

function buildYearData(rows: YearMoodCountRow[]): Record<string, Partial<Record<Mood, number>>> {
  const out: Record<string, Partial<Record<Mood, number>>> = {};
  for (const row of rows) {
    const month = row.month;
    if (!out[month]) out[month] = {};
    out[month][row.mood] = (out[month][row.mood] ?? 0) + row.count;
  }
  return out;
}

export default function YearlyMoodScreen() {
  const theme = useTheme();
  const toast = useToast();

  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [rows, setRows] = useState<YearMoodCountRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadYears();
  }, []);

  async function loadYears() {
    setIsLoading(true);
    try {
      const ys = await listYearsWithMood();
      setYears(ys);
      setSelectedYear((prev) => prev ?? ys[0] ?? null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedYear) return;
    loadYear(selectedYear);
  }, [selectedYear]);

  async function loadYear(year: string) {
    setIsLoading(true);
    try {
      const next = await getYearMoodCounts(year);
      setRows(next);
    } finally {
      setIsLoading(false);
    }
  }

  const data = useMemo(() => buildYearData(rows), [rows]);

  const $container: ViewStyle = {flex: 1};

  const $content: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  };

  const $yearRow: ViewStyle = {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  };

  const $yearPillBase: ViewStyle = {
    height: 34,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  };

  const $yearPillText: TextStyle = {
    fontSize: theme.typography.micro,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  };

  const $empty: ViewStyle = {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    backgroundColor: theme.colors.bgSurface,
    ...theme.shadows.soft,
    gap: theme.spacing.sm,
  };

  const $emptyTitle: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  };

  const $emptyText: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  };

  return (
    <Screen>
      <View style={$container}>
        <AppHeader
          title="Yearly Mood"
          subtitle="Your feelings over time"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />

        <ScrollView contentContainerStyle={$content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={$yearRow}>
            {years.map((y) => {
              const isSelected = selectedYear === y;
              return (
                <Pressable
                  key={y}
                  accessibilityRole="button"
                  accessibilityLabel={`Year ${y}`}
                  onPress={() => setSelectedYear(y)}
                  style={({pressed}) => [
                    $yearPillBase,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.accentPrimary
                        : theme.colors.bgSurface,
                      borderColor: isSelected
                        ? theme.colors.accentDeep
                        : theme.colors.borderCard,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      $yearPillText,
                      {
                        color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {y}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {!selectedYear && !isLoading && (
            <View style={$empty}>
              <Text style={$emptyTitle}>No mood data yet</Text>
              <Text style={$emptyText}>
                Add moods to your entries (via the mood picker) and we’ll build a yearly mood network here.
              </Text>
            </View>
          )}

          {!!selectedYear && (
            <View style={{minHeight: 200}}>
              {isLoading ? (
                <View style={{paddingVertical: theme.spacing.xl}}>
                  <ActivityIndicator color={theme.colors.textSecondary} />
                </View>
              ) : (
                <MoodNetworkGraph
                  year={selectedYear}
                  data={data}
                  onPressMonth={(month, total) => {
                    toast.showToast({
                      title: `${selectedYear}-${month}`,
                      message: total > 0 ? `${total} mood-tagged entries` : "No mood entries",
                    });
                  }}
                  onPressMood={(month, mood, count) => {
                    toast.showToast({
                      title: `${selectedYear}-${month}`,
                      message: `${mood}: ${count}`,
                    });
                  }}
                />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}




