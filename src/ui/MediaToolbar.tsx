import React from "react"
import { View, Pressable, ViewStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface MediaToolbarProps {
  onMicPress: () => void
  onPhotoPress: () => void
}

export function MediaToolbar({ onMicPress, onPhotoPress }: MediaToolbarProps) {
  const theme = useTheme()

  const $container: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  }

  const $button: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.soft,
  }

  return (
    <View style={$container}>
      <Pressable
        style={({ pressed }) => [
          $button,
          {
            opacity: pressed ? 0.6 : 1,
          },
        ]}
        onPress={onMicPress}
      >
        <MaterialIcons
          name="mic"
          size={24}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          $button,
          {
            opacity: pressed ? 0.6 : 1,
          },
        ]}
        onPress={onPhotoPress}
      >
        <MaterialIcons
          name="photo-camera"
          size={24}
          color={theme.colors.textSecondary}
        />
      </Pressable>
    </View>
  )
}





