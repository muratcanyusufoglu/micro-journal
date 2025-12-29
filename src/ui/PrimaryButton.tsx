import React from "react"
import { Pressable, Text, ViewStyle, TextStyle } from "react-native"
import { useTheme } from "../theme/ThemeProvider"

interface PrimaryButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
}

export function PrimaryButton({ title, onPress, disabled, style }: PrimaryButtonProps) {
  const theme = useTheme()

  const $button: ViewStyle = {
    height: 52,
    borderRadius: theme.radius.button,
    backgroundColor: disabled
      ? `${theme.colors.accentPrimary}60`
      : theme.colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  }

  const $text: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "600",
    color: disabled ? theme.colors.textMuted : theme.colors.textPrimary,
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
      disabled={disabled}
    >
      <Text style={$text}>{title}</Text>
    </Pressable>
  )
}







