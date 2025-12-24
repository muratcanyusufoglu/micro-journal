import React from "react"
import { View, Text, Pressable, ViewStyle, TextStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface TextNoteCardProps {
  text: string
  timestamp: string
  isEdited?: boolean
  onMenuPress: () => void
}

export function TextNoteCard({ text, timestamp, isEdited, onMenuPress }: TextNoteCardProps) {
  const theme = useTheme()

  const $card: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  }

  const $header: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  }

  const $text: TextStyle = {
    fontSize: theme.typography.body,
    lineHeight: 25.6,
    color: theme.colors.textPrimary,
    flex: 1,
    paddingRight: theme.spacing.md,
  }

  const $footer: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  }

  const $timestamp: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.5,
  }

  const $editedBadge: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
  }

  const $dot: ViewStyle = {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${theme.colors.textSecondary}40`,
  }

  const $menuButton: ViewStyle = {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    marginTop: -theme.spacing.xs,
    borderRadius: theme.radius.iconButton,
  }

  return (
    <View style={$card}>
      <View style={$header}>
        <Text style={$text}>{text}</Text>
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
        {isEdited && (
          <>
            <View style={$dot} />
            <Text style={$editedBadge}>Edited</Text>
          </>
        )}
      </View>
    </View>
  )
}

