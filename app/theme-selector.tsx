import React from "react"
import { View, Text, Pressable, ScrollView, ViewStyle, TextStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useTheme } from "../src/theme/ThemeProvider"
import { Screen, AppHeader } from "../src/ui"
import type { ThemeName } from "../src/theme/schema"

const themes: { name: ThemeName; label: string; description: string }[] = [
  { name: "light", label: "Light", description: "Classic light theme" },
  { name: "dark", label: "Dark", description: "Easy on the eyes" },
  { name: "warm", label: "Warm", description: "Cozy and inviting" },
  { name: "cool", label: "Cool", description: "Fresh and calm" },
]

export default function ThemeSelectorScreen() {
  const theme = useTheme()

  function handleThemeSelect(themeName: ThemeName) {
    theme.setTheme(themeName)
    router.back()
  }

  const $container: ViewStyle = {
    flex: 1,
  }

  const $scrollContent: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  }

  const $themeCard: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  }

  const $themeCardSelected: ViewStyle = {
    borderColor: theme.colors.accentPrimary,
    borderWidth: 2,
  }

  const $themeHeader: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  }

  const $themeName: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  }

  const $themeDescription: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 4,
  }

  const $checkIcon: ViewStyle = {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
  }

  const $previewSection: ViewStyle = {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  }

  const $previewLabel: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  }

  const $colorPreview: ViewStyle = {
    flexDirection: "row",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  }

  const $colorDot: ViewStyle = {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  }

  return (
    <Screen>
      <View style={$container}>
        <AppHeader
          title="Choose Theme"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />

        <ScrollView contentContainerStyle={$scrollContent}>
          {themes.map((themeOption) => {
            const isSelected = theme.currentTheme === themeOption.name
            const themeColors = require("../src/theme/schema").themeColors[themeOption.name]

            return (
              <Pressable
                key={themeOption.name}
                style={({ pressed }) => [
                  $themeCard,
                  isSelected && $themeCardSelected,
                  {
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => handleThemeSelect(themeOption.name)}
              >
                <View style={$themeHeader}>
                  <Text style={$themeName}>{themeOption.label}</Text>
                  {isSelected && (
                    <View style={$checkIcon}>
                      <MaterialIcons name="check" size={16} color={theme.colors.textPrimary} />
                    </View>
                  )}
                </View>

                <Text style={$themeDescription}>{themeOption.description}</Text>

                <View style={$previewSection}>
                  <Text style={$previewLabel}>Color Preview</Text>
                  <View style={$colorPreview}>
                    <View style={[$colorDot, { backgroundColor: themeColors.bgPrimary }]} />
                    <View style={[$colorDot, { backgroundColor: themeColors.bgSurface }]} />
                    <View style={[$colorDot, { backgroundColor: themeColors.textPrimary }]} />
                    <View style={[$colorDot, { backgroundColor: themeColors.accentPrimary }]} />
                    <View style={[$colorDot, { backgroundColor: themeColors.accentActive }]} />
                  </View>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
    </Screen>
  )
}





