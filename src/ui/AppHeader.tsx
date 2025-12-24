import React from "react"
import { View, Text, ViewStyle, TextStyle } from "react-native"
import { useTheme } from "../theme/ThemeProvider"
import { IconButton } from "./IconButton"

interface AppHeaderProps {
  title: string
  subtitle?: string
  leftIcon?: string
  rightIcon?: string
  onLeftPress?: () => void
  onRightPress?: () => void
}

export function AppHeader({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
}: AppHeaderProps) {
  const theme = useTheme()

  const $container: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  }

  const $centerContent: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }

  const $subtitle: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  }

  const $title: TextStyle = {
    fontSize: theme.typography.sectionSerif,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  }

  const $spacer: ViewStyle = {
    width: 44,
  }

  return (
    <View style={$container}>
      {leftIcon ? (
        <IconButton icon={leftIcon} onPress={onLeftPress} />
      ) : (
        <View style={$spacer} />
      )}

      <View style={$centerContent}>
        {subtitle && <Text style={$subtitle}>{subtitle}</Text>}
        <Text style={$title}>{title}</Text>
      </View>

      {rightIcon ? (
        <IconButton icon={rightIcon} onPress={onRightPress} />
      ) : (
        <View style={$spacer} />
      )}
    </View>
  )
}

