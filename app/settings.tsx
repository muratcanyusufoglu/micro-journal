import {MaterialIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import React from "react";
import {Alert, Pressable, ScrollView, Text, TextStyle, View, ViewStyle} from "react-native";
import {useTheme} from "../src/theme/ThemeProvider";
import {AppHeader, Card, Screen} from "../src/ui";

export default function SettingsScreen() {
  const theme = useTheme();

  function handleAppLock() {
    Alert.alert("App Lock", "This feature is coming soon");
  }

  function handleTheme() {
    router.push("/theme-selector");
  }

  function handleQuickCapture() {
    router.push("/quick-capture");
  }

  function handleBackup() {
    router.push("/backup");
  }

  function handleEmailSettings() {
    router.push("/email-settings");
  }

  function handleYearlyMood() {
    router.push("/yearly-mood");
  }

  const getThemeLabel = (themeName: string) => {
    const labels: Record<string, string> = {
      light: "Light",
      dark: "Dark",
      warm: "Warm",
      cool: "Cool",
    };
    return labels[themeName] || "Light";
  };

  function handleExport() {
    Alert.alert("Export", "This feature requires a Pro subscription");
  }

  function handleAbout() {
    Alert.alert(
      "About OneLine",
      "A calm, premium journal app for capturing life's moments.\n\nVersion 1.0.0",
      [{text: "OK"}]
    );
  }

  const $container: ViewStyle = {
    flex: 1,
  };

  const $scrollContent: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  };

  const $settingsCard: ViewStyle = {
    padding: 0,
    overflow: "hidden",
  };

  const $row: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: 56,
  };

  const $rowDisabled: ViewStyle = {
    opacity: 0.5,
    backgroundColor: `${theme.colors.textMuted}05`,
  };

  const $rowBorder: ViewStyle = {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  };

  const $rowLeft: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  };

  const $rowTitle: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  };

  const $rowSubtitle: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  };

  const $rowRight: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  };

  const $proBadge: ViewStyle = {
    backgroundColor: theme.colors.borderSoft,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  };

  const $proBadgeText: TextStyle = {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };

  const $footer: ViewStyle = {
    marginTop: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.xs,
  };

  const $footerText: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textMuted,
  };

  return (
    <Screen>
      <View style={$container}>
        <AppHeader
          title="Settings"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />

        <ScrollView contentContainerStyle={$scrollContent}>
          <Card style={$settingsCard}>
            <Pressable
              style={({pressed}) => [
                $row,
                $rowBorder,
                {
                  backgroundColor: pressed
                    ? `${theme.colors.textPrimary}05`
                    : "transparent",
                },
              ]}
              onPress={handleAppLock}
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="lock"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <Text style={$rowTitle}>App Lock</Text>
              </View>

              <View style={$rowRight}>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                $row,
                $rowBorder,
                {
                  backgroundColor: pressed
                    ? `${theme.colors.textPrimary}05`
                    : "transparent",
                },
              ]}
              onPress={handleTheme}
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="palette"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <View>
                  <Text style={$rowTitle}>Theme</Text>
                  <Text style={$rowSubtitle}>
                    {getThemeLabel(theme.currentTheme)}
                  </Text>
                </View>
              </View>

              <View style={$rowRight}>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                $row,
                $rowBorder,
                {
                  backgroundColor: pressed
                    ? `${theme.colors.textPrimary}05`
                    : "transparent",
                },
              ]}
              onPress={handleQuickCapture}
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="add-circle-outline"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <View>
                  <Text style={$rowTitle}>Quick Capture</Text>
                  <Text style={$rowSubtitle}>Fast note taking</Text>
                </View>
              </View>

              <View style={$rowRight}>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                $row,
                $rowBorder,
                {
                  backgroundColor: pressed
                    ? `${theme.colors.textPrimary}05`
                    : "transparent",
                },
              ]}
              onPress={handleBackup}
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="backup"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <View>
                  <Text style={$rowTitle}>Backup & Restore</Text>
                  <Text style={$rowSubtitle}>Export ZIP (with media), import soon</Text>
                </View>
              </View>

              <View style={$rowRight}>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                $row,
                $rowBorder,
                {
                  backgroundColor: pressed
                    ? `${theme.colors.textPrimary}05`
                    : "transparent",
                },
              ]}
              onPress={handleYearlyMood}
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="timeline"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <View>
                  <Text style={$rowTitle}>Yearly Mood</Text>
                  <Text style={$rowSubtitle}>See your feelings as a network</Text>
                </View>
              </View>

              <View style={$rowRight}>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                $row,
                $rowBorder,
                {
                  backgroundColor: pressed
                    ? `${theme.colors.textPrimary}05`
                    : "transparent",
                },
              ]}
              onPress={handleEmailSettings}
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="email"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <View>
                  <Text style={$rowTitle}>Email Integration</Text>
                  <Text style={$rowSubtitle}>Send entries via email</Text>
                </View>
              </View>

              <View style={$rowRight}>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>

            <Pressable
              style={[$row, $rowBorder, $rowDisabled]}
              onPress={handleExport}
              disabled
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="ios-share"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <Text style={$rowTitle}>Export</Text>
              </View>

              <View style={$rowRight}>
                <View style={$proBadge}>
                  <Text style={$proBadgeText}>Pro</Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                $row,
                $rowBorder,
                {
                  backgroundColor: pressed
                    ? `${theme.colors.textPrimary}05`
                    : "transparent",
                },
              ]}
              onPress={() => router.push("/qr-scan")}
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="qr-code-scanner"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <View>
                  <Text style={$rowTitle}>QR Code Scanner</Text>
                  <Text style={$rowSubtitle}>Scan QR codes to notes</Text>
                </View>
              </View>

              <View style={$rowRight}>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                $row,
                {
                  backgroundColor: pressed
                    ? `${theme.colors.textPrimary}05`
                    : "transparent",
                },
              ]}
              onPress={handleAbout}
            >
              <View style={$rowLeft}>
                <MaterialIcons
                  name="info"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <Text style={$rowTitle}>About</Text>
              </View>

              <View style={$rowRight}>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            </Pressable>
          </Card>

          <View style={$footer}>
            <Text style={$footerText}>Offline. No account.</Text>
            <Text style={[$footerText, {opacity: 0.6}]}>
              Version 1.0.0 (Build 1)
            </Text>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
