import React from "react"
import { View, Text, Pressable, ViewStyle, TextStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface VoiceNoteCardProps {
  duration: string
  timestamp: string
  isPlaying: boolean
  onPlayPause: () => void
  onMenuPress: () => void
}

export function VoiceNoteCard({
  duration,
  timestamp,
  isPlaying,
  onPlayPause,
  onMenuPress,
}: VoiceNoteCardProps) {
  const theme = useTheme()

  const $card: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  }

  const $content: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  }

  const $playButton: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.bgPrimary,
    alignItems: "center",
    justifyContent: "center",
  }

  const $waveformContainer: ViewStyle = {
    flex: 1,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  }

  const $menuButton: ViewStyle = {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    borderRadius: theme.radius.iconButton,
  }

  const $footer: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
    paddingLeft: 4,
  }

  const $timestamp: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.5,
  }

  const $duration: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textPrimary,
    fontWeight: "700",
    backgroundColor: theme.colors.bgPrimary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  }

  // Fake waveform bars
  const waveformHeights = [12, 20, 32, 16, 24, 12, 20, 8, 28, 16, 12, 24, 16, 8, 20, 12]

  return (
    <View style={$card}>
      <View style={$content}>
        <Pressable
          style={({ pressed }) => [
            $playButton,
            {
              backgroundColor: pressed
                ? theme.colors.accentPrimary
                : theme.colors.bgPrimary,
            },
          ]}
          onPress={onPlayPause}
        >
          <MaterialIcons
            name={isPlaying ? "pause" : "play-arrow"}
            size={28}
            color={theme.colors.textPrimary}
          />
        </Pressable>

        <View style={$waveformContainer}>
          {waveformHeights.map((height, index) => (
            <View
              key={index}
              style={{
                width: 4,
                height,
                backgroundColor: `${theme.colors.textPrimary}60`,
                borderRadius: 2,
              }}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            $menuButton,
            {
              backgroundColor: pressed
                ? `${theme.colors.textPrimary}10`
                : "transparent",
            },
          ]}
          onPress={onMenuPress}
        >
          <MaterialIcons
            name="more-horiz"
            size={24}
            color={`${theme.colors.textPrimary}99`}
          />
        </Pressable>
      </View>

      <View style={$footer}>
        <Text style={$timestamp}>{timestamp}</Text>
        <Text style={$duration}>{duration}</Text>
      </View>
    </View>
  )
}







