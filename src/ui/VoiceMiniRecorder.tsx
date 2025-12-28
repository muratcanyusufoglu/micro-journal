import React from "react"
import { View, Text, Pressable, ViewStyle, TextStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface VoiceMiniRecorderProps {
  isRecording: boolean
  duration: string
  onToggle: () => void
}

export function VoiceMiniRecorder({ isRecording, duration, onToggle }: VoiceMiniRecorderProps) {
  const theme = useTheme()

  if (!isRecording && duration === "00:00") {
    return null
  }

  const $container: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    ...theme.shadows.soft,
  }

  const $indicator: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isRecording ? "#FEE2E2" : theme.colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  }

  const $dot: ViewStyle = {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: isRecording ? "#EF4444" : theme.colors.accentDeep,
  }

  const $textContainer: ViewStyle = {
    flex: 1,
  }

  const $label: TextStyle = {
    fontSize: theme.typography.small,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  }

  const $duration: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }

  const $button: ViewStyle = {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  }

  return (
    <View style={$container}>
      <View style={$indicator}>
        <View style={$dot} />
      </View>

      <View style={$textContainer}>
        <Text style={$label}>
          {isRecording ? "Recording Voice Note" : "Voice Note Recorded"}
        </Text>
        <Text style={$duration}>{duration} / 01:00</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          $button,
          {
            backgroundColor: pressed
              ? `${theme.colors.textPrimary}10`
              : "transparent",
          },
        ]}
        onPress={onToggle}
      >
        <MaterialIcons
          name={isRecording ? "stop-circle" : "check-circle"}
          size={28}
          color={theme.colors.textPrimary}
        />
      </Pressable>
    </View>
  )
}





