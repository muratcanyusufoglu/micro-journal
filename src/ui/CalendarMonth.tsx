import React from "react"
import { View, Text, Pressable, ViewStyle, TextStyle } from "react-native"
import { useTheme } from "../theme/ThemeProvider"

interface CalendarDay {
  date: number
  hasContent: boolean
  isToday: boolean
  dateKey: string
}

interface CalendarMonthProps {
  month: string
  year: number
  days: CalendarDay[]
  selectedDay?: string
  onDayPress: (dateKey: string) => void
}

export function CalendarMonth({
  month,
  year,
  days,
  selectedDay,
  onDayPress,
}: CalendarMonthProps) {
  const theme = useTheme()

  const $container: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    ...theme.shadows.soft,
  }


  const $weekdayRow: ViewStyle = {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  }

  const $weekdayCell: ViewStyle = {
    flex: 1,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  }

  const $weekdayText: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  }

  const $daysGrid: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
  }

  const $dayCell: ViewStyle = {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xs,
  }

  const $dayNumber: TextStyle = {
    fontSize: 15,
    color: theme.colors.textPrimary,
  }

  const $contentDot: ViewStyle = {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accentPrimary,
    marginTop: 4,
  }

  const $selectedRing: ViewStyle = {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.accentPrimary,
  }

  const weekdays = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <View style={$container}>
      <View style={$weekdayRow}>
        {weekdays.map((day, index) => (
          <View key={index} style={$weekdayCell}>
            <Text style={$weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={$daysGrid}>
        {days.map((day, index) => {
          if (!day.date) {
            return <View key={`empty-${index}`} style={$dayCell} />
          }

          const isSelected = day.dateKey === selectedDay

          return (
            <Pressable
              key={day.dateKey}
              style={$dayCell}
              onPress={() => onDayPress(day.dateKey)}
            >
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                {isSelected && <View style={$selectedRing} />}
                <Text style={[$dayNumber, { position: "relative", zIndex: 10 }]}>
                  {day.date}
                </Text>
                {day.hasContent && <View style={$contentDot} />}
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

