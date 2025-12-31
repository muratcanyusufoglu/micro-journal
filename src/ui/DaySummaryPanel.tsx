import React from "react"
import { View, Text, Pressable, ViewStyle, TextStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface DaySummaryPanelProps {
  date: string
  itemCount: number
  previewText?: string
  hasVoice: boolean
  hasPhoto: boolean
  onViewDetails: () => void
}

export function DaySummaryPanel({
  date,
  itemCount,
  previewText,
  hasVoice,
  hasPhoto,
  onViewDetails,
}: DaySummaryPanelProps) {
  const theme = useTheme()

  const $container: ViewStyle = {
    marginTop: theme.spacing.md,
  }

  const $panel: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: theme.radius.card,
    borderBottomRightRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  }

  const $header: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  }

  const $dateText: TextStyle = {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  }

  const $countText: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 4,
  }

  const $icons: ViewStyle = {
    flexDirection: "row",
    gap: theme.spacing.sm,
  }

  const $preview: ViewStyle = {
    position: "relative",
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: `${theme.colors.accentPrimary}66`,
    marginBottom: theme.spacing.lg,
  }

  const $previewText: TextStyle = {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.textPrimary,
  }

  const $button: ViewStyle = {
    width: "100%",
    height: 52,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.bgPrimary,
    alignItems: "center",
    justifyContent: "center",
  }

  const $buttonText: TextStyle = {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  }

  return (
    <View style={$container}>
      <View style={$panel}>
        <View style={$header}>
          <View>
            <Text style={$dateText}>{date}</Text>
            <Text style={$countText}>
              {itemCount} {itemCount === 1 ? "entry" : "entries"}
            </Text>
          </View>

          <View style={$icons}>
            {hasVoice && (
              <MaterialIcons
                name="mic"
                size={20}
                color={theme.colors.accentPrimary}
              />
            )}
            {hasPhoto && (
              <MaterialIcons
                name="photo-camera"
                size={20}
                color={theme.colors.accentPrimary}
              />
            )}
          </View>
        </View>

        {previewText && (
          <View style={$preview}>
            <Text style={$previewText} numberOfLines={2}>
              {previewText}
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            $button,
            {
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onViewDetails}
        >
          <Text style={$buttonText}>View details</Text>
        </Pressable>
      </View>
    </View>
  )
}











