import React from "react"
import { TextInput, View, ViewStyle, TextStyle } from "react-native"
import { useTheme } from "../theme/ThemeProvider"

interface TextAreaCardProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  minHeight?: number
}

export function TextAreaCard({
  value,
  onChangeText,
  placeholder = "One line is enough… or more if you need.",
  minHeight = 280,
}: TextAreaCardProps) {
  const theme = useTheme()

  const $container: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    minHeight,
    ...theme.shadows.soft,
  }

  const $input: TextStyle = {
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.textPrimary,
    fontWeight: "400",
    flex: 1,
  }

  const $placeholderColor = theme.colors.textPlaceholder

  return (
    <View style={$container}>
      <TextInput
        style={$input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={$placeholderColor}
        multiline
        textAlignVertical="top"
      />
    </View>
  )
}

