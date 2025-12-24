import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from "react-native"
import { useTheme } from "../theme/ThemeProvider"
import type { Mood } from "../data/types"

interface MoodRibbonPickerProps {
  value: Mood | null
  onChange: (value: Mood | null) => void
}

type MoodOption = {
  value: Mood
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
}

const MOODS: MoodOption[] = [
  { value: "calm", label: "Calm", colorKey: "tagCalm" },
  { value: "happy", label: "Happy", colorKey: "tagHappy" },
  { value: "reflective", label: "Reflective", colorKey: "tagReflective" },
  { value: "stressed", label: "Stressed", colorKey: "tagStressed" },
  { value: "grateful", label: "Grateful", colorKey: "tagGrateful" },
  { value: "energized", label: "Energized", colorKey: "tagEnergized" },
  { value: "focused", label: "Focused", colorKey: "tagFocused" },
  { value: "sad", label: "Sad", colorKey: "tagSad" },
]

export function MoodRibbonPicker({ value, onChange }: MoodRibbonPickerProps) {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const progress = useRef(new Animated.Value(0)).current

  const controlSize = useMemo(
    () => theme.spacing.xl + theme.spacing.sm + theme.spacing.xs,
    [theme.spacing.xl, theme.spacing.sm, theme.spacing.xs]
  )
  const expandedWidth = useMemo(
    () => theme.spacing.xxl * 5 + theme.spacing.md,
    [theme.spacing.xxl, theme.spacing.md]
  )

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: false, // width animation
    }).start()
  }, [isOpen, progress])

  const selected = MOODS.find((m) => m.value === value) ?? null
  const markerColor = selected ? theme.colors[selected.colorKey] : theme.colors.tagNeutral

  const containerWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [controlSize, expandedWidth],
  })

  const contentOpacity = progress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0, 1],
  })

  const $container: ViewStyle = {
    height: controlSize,
    borderRadius: theme.radius.iconButton,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    backgroundColor: theme.colors.bgSurface,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  }

  const $markerButton: ViewStyle = {
    width: controlSize,
    height: controlSize,
    borderRadius: theme.radius.iconButton,
    alignItems: "center",
    justifyContent: "center",
  }

  const $markerDot: ViewStyle = {
    width: theme.spacing.xl,
    height: theme.spacing.xl,
    borderRadius: theme.radius.thumb,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  }

  const $dotRow: ViewStyle = {
    flex: 1,
    paddingRight: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  }

  const $dotWrap: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  }

  const $pillButton: ViewStyle = {
    height: theme.spacing.xl,
    borderRadius: theme.radius.thumb,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm + theme.spacing.xs,
  }

  const $pillText: TextStyle = {
    fontSize: theme.typography.micro,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: theme.colors.textPrimary,
  }

  function toggleOpen() {
    setIsOpen((prev) => !prev)
  }

  function handleSelect(next: Mood | null) {
    onChange(next)
    setIsOpen(false)
  }

  return (
    <Animated.View style={[$container, { width: containerWidth }]}>
      <Pressable
        style={({ pressed }) => [
          $markerButton,
          {
            backgroundColor: pressed
              ? `${theme.colors.textPrimary}05`
              : "transparent",
          },
        ]}
        onPress={toggleOpen}
        accessibilityRole="button"
        accessibilityLabel={isOpen ? "Close mood picker" : "Open mood picker"}
        accessibilityState={{ expanded: isOpen }}
      >
        <View style={[$markerDot, { backgroundColor: markerColor }]} />
      </Pressable>

      <Animated.View
        style={[
          $dotRow,
          {
            opacity: contentOpacity,
          },
        ]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={$dotWrap}
        >
          {MOODS.map((mood) => {
            const isSelected = value === mood.value
            return (
              <Pressable
                key={mood.value}
                style={({ pressed }) => [
                  $pillButton,
                  {
                    backgroundColor: theme.colors[mood.colorKey],
                    borderColor: isSelected
                      ? theme.colors.accentDeep
                      : theme.colors.borderSoft,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
                onPress={() => handleSelect(isSelected ? null : mood.value)}
                accessibilityRole="button"
                accessibilityLabel={`Mood ${mood.label}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={$pillText}>{mood.label}</Text>
              </Pressable>
            )
          })}

          <Pressable
            style={({ pressed }) => [
              $pillButton,
              {
                backgroundColor: theme.colors.tagNeutral,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
            onPress={() => handleSelect(null)}
            accessibilityRole="button"
            accessibilityLabel="Clear mood"
          >
            <Text style={[$pillText, { color: theme.colors.textSecondary }]}>
              Clear
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  )
}


