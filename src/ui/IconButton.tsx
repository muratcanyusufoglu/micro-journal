import React from "react"
import { Pressable, ViewStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface IconButtonProps {
  icon: string
  onPress?: () => void
  size?: number
  color?: string
}

export function IconButton({ icon, onPress, size = 24, color }: IconButtonProps) {
  const theme = useTheme()

  const $button: ViewStyle = {
    width: 44,
    height: 44,
    borderRadius: theme.radius.iconButton,
    alignItems: "center",
    justifyContent: "center",
  }

  return (
    <Pressable
      style={({ pressed }) => [
        $button,
        {
          backgroundColor: pressed
            ? `${theme.colors.textPrimary}10`
            : "transparent",
        },
      ]}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon as any}
        size={size}
        color={color || theme.colors.textPrimary}
      />
    </Pressable>
  )
}


















