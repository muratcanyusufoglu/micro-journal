import React, { useState, useEffect } from "react"
import { View, ScrollView, ViewStyle, Alert } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useTheme } from "../../src/theme/ThemeProvider"
import {
  Screen,
  AppHeader,
  TextNoteCard,
  VoiceNoteCard,
  PhotoNoteCard,
  FloatingActionButton,
  BottomSheet,
  SecondaryButton,
} from "../../src/ui"
import { useVoicePlayer } from "../../src/hooks/useVoicePlayer"
import {
  listEntriesByDate,
  formatDisplayDate,
  formatDisplayTime,
  deleteEntry,
} from "../../src/data"
import type { Entry } from "../../src/data/types"

export default function DayDetailScreen() {
  const theme = useTheme()
  const params = useLocalSearchParams()
  const dateKey = params.dateKey as string

  const [entries, setEntries] = useState<Entry[]>([])
  const [showAddSheet, setShowAddSheet] = useState(false)

  useEffect(() => {
    if (dateKey) {
      loadEntries()
    }
  }, [dateKey])

  async function loadEntries() {
    const data = await listEntriesByDate(dateKey)
    setEntries(data)
  }

  async function handleDeleteEntry(entryId: number) {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(entryId)
          await loadEntries()
        },
      },
    ])
  }

  function handleEntryMenu(entry: Entry) {
    const options = ["Delete"]
    if (entry.type === "text") {
      options.unshift("Edit", "View History")
    }

    Alert.alert("Entry Options", "", [
      ...options.map((option) => ({
        text: option,
        onPress: () => {
          if (option === "Delete") {
            handleDeleteEntry(entry.id)
          } else if (option === "View History") {
            router.push(`/revision/${entry.id}`)
          } else if (option === "Edit") {
            // TODO: Open edit modal
          }
        },
      })),
      { text: "Cancel", style: "cancel" },
    ])
  }

  const $container: ViewStyle = {
    flex: 1,
  }

  const $scrollContent: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
    paddingBottom: 100,
  }

  const $sheetContent: ViewStyle = {
    gap: theme.spacing.md,
  }

  return (
    <Screen>
      <View style={$container}>
        <AppHeader
          title={formatDisplayDate(dateKey)}
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />

        <ScrollView contentContainerStyle={$scrollContent}>
          {entries.map((entry) => {
            if (entry.type === "text") {
              return (
                <TextNoteCard
                  key={entry.id}
                  text={entry.textContent || ""}
                  timestamp={formatDisplayTime(entry.createdAt)}
                  isEdited={entry.isEdited === 1}
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
        </ScrollView>

        <FloatingActionButton onPress={() => setShowAddSheet(true)} />

        <BottomSheet
          visible={showAddSheet}
          title="Add Entry"
          onClose={() => setShowAddSheet(false)}
        >
          <View style={$sheetContent}>
            <SecondaryButton
              title="Text Note"
              onPress={() => {
                setShowAddSheet(false)
                // TODO: Navigate to Today and pre-fill date
                router.push("/")
              }}
            />
            <SecondaryButton
              title="Voice Note"
              onPress={() => {
                setShowAddSheet(false)
                router.push("/")
              }}
            />
            <SecondaryButton
              title="Photo"
              onPress={() => {
                setShowAddSheet(false)
                router.push("/")
              }}
            />
          </View>
        </BottomSheet>
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

