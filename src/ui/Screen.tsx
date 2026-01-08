import React from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "../theme/ThemeProvider"

interface ScreenProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function Screen({ children, style }: ScreenProps) {
  const theme = useTheme()

  const $container: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  }

  return (
    <SafeAreaView style={[$container, style]} edges={["top", "bottom"]}>
      {children}
    </SafeAreaView>
  )
}


















