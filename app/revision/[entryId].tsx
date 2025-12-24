import {router, useLocalSearchParams} from "expo-router";
import React, {useEffect, useState} from "react";
import {ScrollView, Text, TextStyle, View, ViewStyle} from "react-native";
import {formatDisplayTime, getDatabase, listRevisions} from "../../src/data";
import type {Entry, TextRevision} from "../../src/data/types";
import {useTheme} from "../../src/theme/ThemeProvider";
import {AppHeader, Screen} from "../../src/ui";

interface RevisionWithLabel extends TextRevision {
  label: string;
  isCurrent?: boolean;
}

export default function RevisionHistoryScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const entryId = parseInt(params.entryId as string);

  const [revisions, setRevisions] = useState<RevisionWithLabel[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);

  useEffect(() => {
    if (entryId) {
      loadRevisions();
    }
  }, [entryId]);

  async function loadRevisions() {
    const db = await getDatabase();

    // Get current entry
    const entry = await db.getFirstAsync<Entry>(
      "SELECT * FROM entries WHERE id = ?",
      [entryId]
    );

    if (entry) {
      setCurrentEntry(entry);
    }

    // Get revisions
    const revisionData = await listRevisions(entryId);

    const revisionsWithLabels: RevisionWithLabel[] = revisionData.map(
      (rev) => ({
        ...rev,
        label: formatDisplayTime(rev.createdAt),
      })
    );

    setRevisions(revisionsWithLabels);
  }

  const $container: ViewStyle = {
    flex: 1,
  };

  const $scrollContent: ViewStyle = {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  };

  const $currentSection: ViewStyle = {
    marginBottom: theme.spacing.xl,
  };

  const $sectionHeader: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  };

  const $currentDot: ViewStyle = {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textPrimary,
  };

  const $sectionLabel: TextStyle = {
    fontSize: theme.typography.micro,
    fontWeight: "500",
    color: theme.colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    opacity: 0.8,
  };

  const $revisionCard: ViewStyle = {
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.textPrimary,
    paddingVertical: theme.spacing.xs,
  };

  const $timestamp: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textMuted,
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  };

  const $text: TextStyle = {
    fontSize: 17,
    lineHeight: 27.2,
    color: theme.colors.textPrimary,
  };

  const $revisionsSection: ViewStyle = {
    gap: theme.spacing.xl,
    position: "relative",
  };

  const $revisionItem: ViewStyle = {
    opacity: 0.7,
  };

  const $revisionHeader: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  };

  const $revisionDot: ViewStyle = {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textMuted,
    borderWidth: 4,
    borderColor: theme.colors.bgPrimary,
  };

  const $revisionText: TextStyle = {
    fontSize: 16,
    lineHeight: 25.6,
    color: theme.colors.textMuted,
    paddingLeft: theme.spacing.md,
  };

  const $timeline: ViewStyle = {
    position: "absolute",
    left: 3,
    top: theme.spacing.md,
    bottom: theme.spacing.md,
    width: 1,
    backgroundColor: theme.colors.borderSoft,
    zIndex: -1,
  };

  const $emptyState: ViewStyle = {
    paddingVertical: theme.spacing.xl,
  };

  const $emptyText: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  };

  return (
    <Screen>
      <View style={$container}>
        <AppHeader
          title="Revision History"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />

        <ScrollView contentContainerStyle={$scrollContent}>
          {currentEntry && (
            <View style={$currentSection}>
              <View style={$sectionHeader}>
                <View style={$currentDot} />
                <Text style={$sectionLabel}>Current Version</Text>
              </View>

              <View style={$revisionCard}>
                <Text style={$timestamp}>
                  {formatDisplayTime(currentEntry.updatedAt)}
                </Text>
                <Text style={$text}>{currentEntry.textContent}</Text>
              </View>
            </View>
          )}

          {revisions.length > 0 && (
            <View style={$revisionsSection}>
              <View style={$timeline} />

              {revisions.map((revision) => (
                <View key={revision.id} style={$revisionItem}>
                  <View style={$revisionHeader}>
                    <View style={$revisionDot} />
                    <Text style={$timestamp}>{revision.label}</Text>
                  </View>

                  <Text style={$revisionText}>{revision.textContent}</Text>
                </View>
              ))}
            </View>
          )}

          {revisions.length === 0 && (
            <View style={$emptyState}>
              <Text style={$emptyText}>No previous versions</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}
