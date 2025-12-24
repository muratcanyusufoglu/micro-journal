import React, { useState } from "react"
import { View, Text, Pressable, ViewStyle, TextStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { Image as ExpoImage } from "expo-image"
import { useTheme } from "../theme/ThemeProvider"
import { PhotoViewerModal } from "./PhotoViewerModal"
import type { Mood } from "../data/types"

interface PhotoTextNoteCardProps {
  photoUri: string
  text: string
  timestamp: string
  mood?: Mood | null
  onMenuPress: () => void
}

export function PhotoTextNoteCard({
  photoUri,
  text,
  timestamp,
  mood,
  onMenuPress,
}: PhotoTextNoteCardProps) {
  const theme = useTheme()
  const [isViewerVisible, setIsViewerVisible] = useState(false)

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
    borderRadius: theme.radius.thumb,
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
    gap: theme.spacing.sm,
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

  const $timestampRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }

  const $timestamp: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.5,
  }

  const $menuButton: ViewStyle = {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    borderRadius: theme.radius.iconButton,
  }

  const moodMeta = getMoodMeta(mood)

  return (
    <View style={$card}>
      <Pressable
        style={({ pressed }) => [
          $imageContainer,
          {
            opacity: pressed ? 0.95 : 1,
          },
        ]}
        onPress={() => setIsViewerVisible(true)}
      >
        <ExpoImage source={{ uri: photoUri }} style={$image} contentFit="cover" />
      </Pressable>

      <View style={$footer}>
        <View style={$header}>
          <Text style={$text} numberOfLines={3}>
            {text}
          </Text>
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

        <View style={$timestampRow}>
          <Text style={$timestamp}>{timestamp}</Text>
          {moodMeta && (
            <View
              style={{
                backgroundColor: theme.colors[moodMeta.colorKey],
                borderRadius: theme.radius.thumb,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderWidth: 1,
                borderColor: theme.colors.borderSoft,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.micro,
                  fontWeight: "700",
                  letterSpacing: 0.4,
                  color: theme.colors.textPrimary,
                }}
              >
                {moodMeta.label}
              </Text>
            </View>
          )}
        </View>
      </View>

      <PhotoViewerModal
        visible={isViewerVisible}
        photoUri={photoUri}
        onClose={() => setIsViewerVisible(false)}
      />
    </View>
  )
}

function getMoodMeta(
  mood: Mood | null | undefined
): {
  label: string
  colorKey:
    | "tagCalm"
    | "tagHappy"
    | "tagReflective"
    | "tagStressed"
    | "tagGrateful"
    | "tagEnergized"
    | "tagFocused"
    | "tagSad"
} | null {
  if (!mood) return null

  return mood === "calm"
    ? { label: "Calm", colorKey: "tagCalm" }
    : mood === "happy"
      ? { label: "Happy", colorKey: "tagHappy" }
      : mood === "reflective"
        ? { label: "Reflective", colorKey: "tagReflective" }
        : mood === "stressed"
          ? { label: "Stressed", colorKey: "tagStressed" }
          : mood === "grateful"
            ? { label: "Grateful", colorKey: "tagGrateful" }
            : mood === "energized"
              ? { label: "Energized", colorKey: "tagEnergized" }
              : mood === "focused"
                ? { label: "Focused", colorKey: "tagFocused" }
                : { label: "Sad", colorKey: "tagSad" }
}


