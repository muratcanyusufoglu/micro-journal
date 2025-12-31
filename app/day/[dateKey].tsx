import React, { useState, useEffect } from "react"
import { View, ScrollView, ViewStyle, Alert } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useTheme } from "../../src/theme/ThemeProvider"
import {
  Screen,
  AppHeader,
  ActionSheet,
  TextNoteCard,
  VoiceNoteCard,
  PhotoNoteCard,
  PhotoTextNoteCard,
  FloatingActionButton,
  BottomSheet,
  SecondaryButton,
  TextEditorSheet,
  useToast,
} from "../../src/ui"
import { useVoicePlayer } from "../../src/hooks/useVoicePlayer"
import {
  listEntriesByDate,
  formatDisplayDate,
  formatDisplayTime,
  deleteEntry,
  updateTextEntry,
} from "../../src/data"
import type { Entry } from "../../src/data/types"

export default function DayDetailScreen() {
  const theme = useTheme()
  const toast = useToast()
  const params = useLocalSearchParams()
  const dateKey = params.dateKey as string

  const [entries, setEntries] = useState<Entry[]>([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [menuEntry, setMenuEntry] = useState<Entry | null>(null)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)

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
    setMenuEntry(entry)
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
                  onPress: () => {
                    setEditEntry(menuEntry)
                  },
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

      <TextEditorSheet
        visible={!!editEntry}
        title="Edit Entry"
        initialValue={editEntry?.textContent || ""}
        initialMood={editEntry?.mood || null}
        onClose={() => setEditEntry(null)}
        onSave={async (nextText, nextMood) => {
          if (!editEntry) return
          await updateTextEntry(editEntry.id, nextText, nextMood ?? null)
          await loadEntries()
          toast.showToast({title: "Saved", message: "Entry updated"})
        }}
      />
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

