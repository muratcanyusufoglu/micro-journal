import React, { useState, useEffect } from "react"
import { View, Text, Pressable, ScrollView, ViewStyle, TextStyle, ActivityIndicator, Alert } from "react-native"
import { router } from "expo-router"
import { useTheme } from "../src/theme/ThemeProvider"
import { 
  Screen, 
  ActionSheet,
  IconButton, 
  CalendarMonth, 
  DaySummaryPanel,
  TextNoteCard,
  VoiceNoteCard,
  PhotoNoteCard,
  PhotoTextNoteCard,
  SecondaryButton,
} from "../src/ui"
import { useVoicePlayer } from "../src/hooks/useVoicePlayer"
import {
  getDaySummary,
  getEntriesWithContentByMonth,
  listAllEntries,
  getTotalEntriesCount,
  formatDisplayTime,
  deleteEntry,
} from "../src/data"
import type { DaySummary, Entry } from "../src/data/types"

interface CalendarDay {
  date: number
  hasContent: boolean
  isToday: boolean
  dateKey: string
}

export default function CalendarScreen() {
  const theme = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | undefined>()
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null)
  const [daysWithContent, setDaysWithContent] = useState<string[]>([])
  
  // All entries view (when no day selected)
  const [allEntries, setAllEntries] = useState<Entry[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [menuEntry, setMenuEntry] = useState<Entry | null>(null)
  const PAGE_SIZE = 30

  useEffect(() => {
    loadMonth()
    loadAllEntries(true) // Initial load
  }, [currentDate])

  async function loadMonth() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const dateKeys = await getEntriesWithContentByMonth(year, month)
    setDaysWithContent(dateKeys)
  }

  async function loadAllEntries(reset: boolean = false) {
    if (isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const offset = reset ? 0 : allEntries.length
      const entries = await listAllEntries(PAGE_SIZE, offset)
      const total = await getTotalEntriesCount()
      
      setTotalCount(total)
      
      if (reset) {
        setAllEntries(entries)
      } else {
        setAllEntries(prev => [...prev, ...entries])
      }
      
      setHasMore(offset + entries.length < total)
    } catch (error) {
      console.error("Error loading entries:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function handleDayPress(dateKey: string) {
    setSelectedDay(dateKey)
    const summary = await getDaySummary(dateKey)
    setDaySummary(summary)
  }
  
  async function handleDeleteEntry(entryId: number) {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(entryId)
          await loadAllEntries(true)
          await loadMonth()
        },
      },
    ])
  }

  function handleEntryMenu(entry: Entry) {
    setMenuEntry(entry)
  }

  function handlePrevMonth() {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
    setSelectedDay(undefined)
    setDaySummary(null)
  }

  function handleNextMonth() {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
    setSelectedDay(undefined)
    setDaySummary(null)
  }

  function handleViewDetails() {
    if (selectedDay) {
      router.push(`/day/${selectedDay}`)
    }
  }

  const days = generateCalendarDays(currentDate, daysWithContent)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const $container: ViewStyle = {
    flex: 1,
  }

  const $scrollContent: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  }

  const $allEntriesSection: ViewStyle = {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  }

  const $sectionHeader: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  }

  const $sectionTitle: TextStyle = {
    fontSize: theme.typography.small,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  }

  const $dateHeader: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  }

  const $loadMoreContainer: ViewStyle = {
    marginTop: theme.spacing.lg,
    alignItems: "center",
  }

  const $emptyText: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: theme.spacing.xl,
  }

  // Group entries by date
  const groupedEntries = allEntries.reduce((acc, entry) => {
    if (!acc[entry.dateKey]) {
      acc[entry.dateKey] = []
    }
    acc[entry.dateKey].push(entry)
    return acc
  }, {} as Record<string, Entry[]>)

  const $header: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  }

  const $monthTitle: TextStyle = {
    fontSize: theme.typography.sectionSerif,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  }

  const $navButton: ViewStyle = {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  }

  return (
    <Screen>
      <ActionSheet
        visible={!!menuEntry}
        title="Entry Options"
        onClose={() => setMenuEntry(null)}
        actions={[
          ...(menuEntry?.type === "text"
            ? [
                {
                  label: "Edit",
                  icon: "edit",
                  onPress: () => {},
                },
                {
                  label: "View History",
                  icon: "history",
                  onPress: () => {
                    if (!menuEntry) return
                    router.push(`/revision/${menuEntry.id}`)
                  },
                },
              ]
            : []),
          {
            label: "Delete",
            icon: "delete-outline",
            variant: "destructive",
            onPress: () => {
              if (!menuEntry) return
              handleDeleteEntry(menuEntry.id)
            },
          },
        ]}
      />
      <View style={$container}>
        <View style={$header}>
          <IconButton icon="arrow-back" onPress={() => router.back()} />
          
          <Pressable
            style={({ pressed }) => [
              $navButton,
              {
                backgroundColor: pressed
                  ? `${theme.colors.textPrimary}05`
                  : "transparent",
              },
            ]}
            onPress={handlePrevMonth}
          >
            <Text style={{ fontSize: 28, color: theme.colors.textPrimary }}>‹</Text>
          </Pressable>

          <Text style={$monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>

          <Pressable
            style={({ pressed }) => [
              $navButton,
              {
                backgroundColor: pressed
                  ? `${theme.colors.textPrimary}05`
                  : "transparent",
              },
            ]}
            onPress={handleNextMonth}
          >
            <Text style={{ fontSize: 28, color: theme.colors.textPrimary }}>›</Text>
          </Pressable>
          
          <View style={{ width: 44 }} />
        </View>
        
        <ScrollView contentContainerStyle={$scrollContent}>
          <CalendarMonth
            month={monthNames[currentDate.getMonth()]}
            year={currentDate.getFullYear()}
            days={days}
            selectedDay={selectedDay}
            onDayPress={handleDayPress}
          />

          {selectedDay ? (
            // Show day summary when a day is selected
            daySummary && (
              <DaySummaryPanel
                date={formatShortDate(selectedDay)}
                itemCount={daySummary.itemCount}
                previewText={daySummary.previewText || undefined}
                hasVoice={daySummary.hasVoice}
                hasPhoto={daySummary.hasPhoto}
                onViewDetails={handleViewDetails}
              />
            )
          ) : (
            // Show all entries when no day is selected
            <View style={$allEntriesSection}>
              <View style={$sectionHeader}>
                <Text style={$sectionTitle}>All Entries ({totalCount})</Text>
              </View>

              {allEntries.length === 0 ? (
                <Text style={$emptyText}>No entries yet. Start journaling today!</Text>
              ) : (
                <>
                  {Object.keys(groupedEntries).map((dateKey) => (
                    <View key={dateKey}>
                      <Text style={$dateHeader}>{formatShortDate(dateKey)}</Text>
                      {groupedEntries[dateKey].map((entry) => {
                        if (entry.type === "text") {
                          return (
                            <TextNoteCard
                              key={entry.id}
                              text={entry.textContent || ""}
                              timestamp={formatDisplayTime(entry.createdAt)}
                              isEdited={entry.isEdited === 1}
                              mood={entry.mood}
                              onMenuPress={() => handleEntryMenu(entry)}
                            />
                          )
                        }

                        if (entry.type === "voice") {
                          return (
                            <VoiceNoteCardWrapper
                              key={entry.id}
                              entry={entry}
                              onMenuPress={() => handleEntryMenu(entry)}
                            />
                          )
                        }

                        if (entry.type === "photo") {
                          if (entry.textContent && entry.textContent.trim().length > 0) {
                            return (
                              <PhotoTextNoteCard
                                key={entry.id}
                                photoUri={entry.photoUri || ""}
                                text={entry.textContent}
                                timestamp={formatDisplayTime(entry.createdAt)}
                                mood={entry.mood}
                                onMenuPress={() => handleEntryMenu(entry)}
                              />
                            )
                          }
                          return (
                            <PhotoNoteCard
                              key={entry.id}
                              photoUri={entry.photoUri || ""}
                              title={entry.photoTitle || undefined}
                              timestamp={formatDisplayTime(entry.createdAt)}
                              onMenuPress={() => handleEntryMenu(entry)}
                            />
                          )
                        }

                        return null
                      })}
                    </View>
                  ))}

                  {hasMore && (
                    <View style={$loadMoreContainer}>
                      {isLoadingMore ? (
                        <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
                      ) : (
                        <SecondaryButton
                          title="Load More"
                          onPress={() => loadAllEntries(false)}
                        />
                      )}
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  )
}

function VoiceNoteCardWrapper({ entry, onMenuPress }: { entry: Entry; onMenuPress: () => void }) {
  const player = useVoicePlayer(entry.audioUri || "")

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  return (
    <VoiceNoteCard
      duration={formatDuration(entry.durationMs || 0)}
      timestamp={formatDisplayTime(entry.createdAt)}
      isPlaying={player.isPlaying}
      onPlayPause={player.togglePlayPause}
      onMenuPress={onMenuPress}
    />
  )
}

function generateCalendarDays(date: Date, daysWithContent: string[]): CalendarDay[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const today = new Date()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: CalendarDay[] = []

  for (let i = 0; i < firstDay; i++) {
    days.push({
      date: 0,
      hasContent: false,
      isToday: false,
      dateKey: "",
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day

    days.push({
      date: day,
      hasContent: daysWithContent.includes(dateKey),
      isToday,
      dateKey,
    })
  }

  return days
}

function formatShortDate(dateKey: string): string {
  const date = new Date(dateKey)
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
}

