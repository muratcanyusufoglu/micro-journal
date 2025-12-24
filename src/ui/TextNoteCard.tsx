import {MaterialIcons} from "@expo/vector-icons";
import {LinearGradient} from "expo-linear-gradient";
import React from "react";
import {Pressable, Text, TextStyle, View, ViewStyle} from "react-native";
import type {Mood} from "../data/types";
import {useTheme} from "../theme/ThemeProvider";

interface TextNoteCardProps {
  text: string;
  timestamp: string;
  isEdited?: boolean;
  mood?: Mood | null;
  onMenuPress: () => void;
}

export function TextNoteCard({
  text,
  timestamp,
  isEdited,
  mood,
  onMenuPress,
}: TextNoteCardProps) {
  const theme = useTheme();

  const $outer: ViewStyle = {
    borderRadius: theme.radius.card,
    ...theme.shadows.soft,
  };

  const $card: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    overflow: "hidden",
  };

  const $header: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  };

  const $text: TextStyle = {
    fontSize: theme.typography.body,
    lineHeight: 25.6,
    color: theme.colors.textPrimary,
    flex: 1,
    paddingRight: theme.spacing.md,
  };

  const $footer: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  };

  const $timestamp: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.5,
  };

  const $editedBadge: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
  };

  const $dot: ViewStyle = {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${theme.colors.textSecondary}40`,
  };

  const $menuButton: ViewStyle = {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    marginTop: -theme.spacing.xs,
    borderRadius: theme.radius.iconButton,
  };

  const moodMeta = getMoodMeta(mood);

  const $moodGradient: ViewStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  return (
    <View style={$outer}>
      <View style={$card}>
        {moodMeta && (
          <LinearGradient
            colors={[
              "transparent",
              "transparent",
              withAlpha(theme.colors[moodMeta.colorKey], 0.12),
              withAlpha(theme.colors[moodMeta.colorKey], 0.22),
            ]}
            locations={[0, 0.68, 0.86, 1]}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}
            style={$moodGradient}
            pointerEvents="none"
          />
        )}

        <View style={$header}>
          <Text style={$text}>{text}</Text>
          <Pressable
            style={({pressed}) => [
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

        <View style={$footer}>
          <Text style={$timestamp}>{timestamp}</Text>
          {isEdited && (
            <>
              <View style={$dot} />
              <Text style={$editedBadge}>Edited</Text>
            </>
          )}

          {moodMeta && (
            <View style={{marginLeft: "auto"}}>
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
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function getMoodMeta(mood: Mood | null | undefined): {
  label: string;
  colorKey:
    | "tagCalm"
    | "tagHappy"
    | "tagReflective"
    | "tagStressed"
    | "tagGrateful"
    | "tagEnergized"
    | "tagFocused"
    | "tagSad";
} | null {
  if (!mood) return null;

  return {
    label:
      mood === "calm"
        ? "Calm"
        : mood === "happy"
        ? "Happy"
        : mood === "reflective"
        ? "Reflective"
        : mood === "stressed"
        ? "Stressed"
        : mood === "grateful"
        ? "Grateful"
        : mood === "energized"
        ? "Energized"
        : mood === "focused"
        ? "Focused"
        : "Sad",
    colorKey:
      mood === "calm"
        ? "tagCalm"
        : mood === "happy"
        ? "tagHappy"
        : mood === "reflective"
        ? "tagReflective"
        : mood === "stressed"
        ? "tagStressed"
        : mood === "grateful"
        ? "tagGrateful"
        : mood === "energized"
        ? "tagEnergized"
        : mood === "focused"
        ? "tagFocused"
        : "tagSad",
  };
}

function withAlpha(hexColor: string, alpha: number): string {
  // Supports #RRGGBB
  if (!hexColor.startsWith("#") || hexColor.length !== 7) return hexColor;
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
