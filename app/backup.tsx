import React, {useMemo, useState} from "react";
import {ScrollView, Switch, Text, TextInput, TextStyle, View, ViewStyle} from "react-native";
import {router} from "expo-router";
import * as FileSystem from "expo-file-system";
import {AppHeader, Card, PrimaryButton, Screen, SecondaryButton, useToast} from "../src/ui";
import {useTheme} from "../src/theme/ThemeProvider";
import {exportEntriesToZip} from "../src/data";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function startOfYear(): string {
  const d = new Date();
  return `${d.getFullYear()}-01-01`;
}

export default function BackupScreen() {
  const theme = useTheme();
  const toast = useToast();

  const [startDate, setStartDate] = useState(startOfYear());
  const [endDate, setEndDate] = useState(today());
  const [includeMedia, setIncludeMedia] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const $container: ViewStyle = {flex: 1};
  const $content: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  };

  const $label: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  };

  const $input: ViewStyle = {
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.bgSurface,
  };

  const $row: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const $sectionTitle: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  };

  const $hint: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textMuted,
    lineHeight: 16,
  };

  async function handleExport() {
    setIsExporting(true);
    try {
      const result = await exportEntriesToZip({
        startDate,
        endDate,
        includeMedia,
      });

      toast.showToast({
        title: "Exported",
        message: `${result.entryCount} entries, ${result.mediaCount} files\nSaved to: ${result.path}`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.showToast({
        title: "Export failed",
        message: "Could not create backup. Please try again.",
        variant: "error",
      });
    } finally {
      setIsExporting(false);
    }
  }

  const storageInfo = useMemo(() => FileSystem.documentDirectory ?? "", []);

  return (
    <Screen>
      <View style={$container}>
        <AppHeader
          title="Backup & Restore"
          subtitle="Local-only"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />

        <ScrollView contentContainerStyle={$content}>
          <Card>
            <Text style={$sectionTitle}>Export</Text>

            <Text style={$label}>Start date (YYYY-MM-DD)</Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              style={$input}
              placeholder="2024-01-01"
              placeholderTextColor={theme.colors.textPlaceholder}
            />

            <View style={{height: theme.spacing.md}} />

            <Text style={$label}>End date (YYYY-MM-DD)</Text>
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              style={$input}
              placeholder="2024-12-31"
              placeholderTextColor={theme.colors.textPlaceholder}
            />

            <View style={{height: theme.spacing.md}} />

            <View style={$row}>
              <View style={{flex: 1}}>
                <Text style={$label}>Include photos & audio</Text>
                <Text style={$hint}>Larger backups if media is included</Text>
              </View>
              <Switch value={includeMedia} onValueChange={setIncludeMedia} />
            </View>

            <View style={{height: theme.spacing.md}} />

            <PrimaryButton
              title={isExporting ? "Exporting..." : "Export to ZIP"}
              onPress={handleExport}
              disabled={isExporting}
            />

            <View style={{height: theme.spacing.sm}} />
            <Text style={$hint}>Saved under app storage: {storageInfo}</Text>
          </Card>

          <Card>
            <Text style={$sectionTitle}>Import</Text>
            <Text style={$hint}>
              Import from a previously exported ZIP file. (Coming soon)
            </Text>
            <View style={{height: theme.spacing.sm}} />
            <SecondaryButton
              title="Import from ZIP (soon)"
              onPress={() =>
                toast.showToast({
                  title: "Coming soon",
                  message: "Import is under development",
                })
              }
            />
          </Card>
        </ScrollView>
      </View>
    </Screen>
  );
}



