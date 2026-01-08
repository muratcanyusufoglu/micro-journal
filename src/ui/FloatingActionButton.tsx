import React from "react"
import { Pressable, ViewStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface FloatingActionButtonProps {
  onPress: () => void
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const theme = useTheme()

  const $fab: ViewStyle = {
    position: "absolute",
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.medium,
  }

  return (
    <Pressable
      style={({ pressed }) => [
        $fab,
        {
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <MaterialIcons name="add" size={32} color={theme.colors.textPrimary} />
    </Pressable>
  )
}


















