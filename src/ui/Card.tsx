import React from "react"
import { View, ViewStyle } from "react-native"
import { useTheme } from "../theme/ThemeProvider"

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function Card({ children, style }: CardProps) {
  const theme = useTheme()

  const $card: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  }

  return <View style={[$card, style]}>{children}</View>
}


