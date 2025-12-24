import React from "react"
import { Pressable, Text, ViewStyle, TextStyle } from "react-native"
import { useTheme } from "../theme/ThemeProvider"

interface SecondaryButtonProps {
  title: string
  onPress: () => void
  style?: ViewStyle
}

export function SecondaryButton({ title, onPress, style }: SecondaryButtonProps) {
  const theme = useTheme()

  const $button: ViewStyle = {
    height: 52,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  }

  const $text: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  }

  return (
    <Pressable
      style={({ pressed }) => [
        $button,
        style,
        {
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Text style={$text}>{title}</Text>
    </Pressable>
  )
}

