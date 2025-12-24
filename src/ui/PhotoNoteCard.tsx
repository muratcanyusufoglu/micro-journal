import React from "react"
import { View, Text, Image, Pressable, ViewStyle, TextStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface PhotoNoteCardProps {
  photoUri: string
  title?: string
  timestamp: string
  onMenuPress: () => void
}

export function PhotoNoteCard({ photoUri, title, timestamp, onMenuPress }: PhotoNoteCardProps) {
  const theme = useTheme()

  const $card: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  }

  const $imageContainer: ViewStyle = {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: theme.colors.bgPrimary,
  }

  const $image: ViewStyle = {
    width: "100%",
    height: "100%",
  }

  const $footer: ViewStyle = {
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.md,
  }

  const $header: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }

  const $title: TextStyle = {
    fontSize: 18,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  }

  const $timestamp: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginTop: 4,
  }

  const $menuButton: ViewStyle = {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    borderRadius: theme.radius.iconButton,
  }

  return (
    <View style={$card}>
      <View style={$imageContainer}>
        <Image source={{ uri: photoUri }} style={$image} resizeMode="cover" />
      </View>

      <View style={$footer}>
        <View style={$header}>
          {title && <Text style={$title}>{title}</Text>}
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
        <Text style={$timestamp}>{timestamp}</Text>
      </View>
    </View>
  )
}

