import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, ViewStyle, TextStyle, Alert } from "react-native"
import { router } from "expo-router"
import { useTheme } from "../src/theme/ThemeProvider"
import {
  Screen,
  IconButton,
  TextAreaCard,
  MoodRibbonPicker,
  MediaToolbar,
  PrimaryButton,
  VoiceMiniRecorder,
  PhotoGrid,
  TextNoteCard,
  VoiceNoteCard,
  PhotoNoteCard,
} from "../src/ui"
import { useVoiceRecorder } from "../src/hooks/useVoiceRecorder"
import { usePhotoPicker } from "../src/hooks/usePhotoPicker"
import { useVoicePlayer } from "../src/hooks/useVoicePlayer"
import {
  getTodayDateKey,
  addTextEntry,
  addVoiceEntry,
  addPhotoEntry,
  listEntriesByDate,
  formatDisplayTime,
  deleteEntry,
} from "../src/data"
import type { Entry, Mood } from "../src/data/types"

export default function TodayScreen() {
  const theme = useTheme()
  const [text, setText] = useState("")
  const [mood, setMood] = useState<Mood | null>(null)
  const [todayEntries, setTodayEntries] = useState<Entry[]>([])
  const [dateKey, setDateKey] = useState("")

  const voiceRecorder = useVoiceRecorder()
  const photoPicker = usePhotoPicker()

  useEffect(() => {
    loadTodayEntries()
  }, [])

  async function loadTodayEntries() {
    const today = await getTodayDateKey()
    setDateKey(today)
    const entries = await listEntriesByDate(today)
    setTodayEntries(entries)
  }

  async function handleAddToToday() {
    if (!text.trim() && !voiceRecorder.recordedUri && photoPicker.photos.length === 0) {
      return
    }

    try {
      if (text.trim()) {
        await addTextEntry(dateKey, text.trim(), mood)
        setText("")
        setMood(null)
      }

      if (voiceRecorder.recordedUri) {
        await addVoiceEntry(dateKey, voiceRecorder.recordedUri, voiceRecorder.recordingDuration)
        voiceRecorder.resetRecording()
      }

      for (const photoUri of photoPicker.photos) {
        await addPhotoEntry(dateKey, photoUri)
      }
      photoPicker.resetPhotos()

      await loadTodayEntries()
    } catch (error) {
      console.error("Error adding entries:", error)
      Alert.alert("Error", "Failed to add entry")
    }
  }

  async function handleDeleteEntry(entryId: number) {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(entryId)
          await loadTodayEntries()
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

  const hasContent = text.trim() || voiceRecorder.recordedUri || photoPicker.photos.length > 0

  const $container: ViewStyle = {
    flex: 1,
  }

  const $header: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  }

  const $headerCenter: ViewStyle = {
    flex: 1,
    alignItems: "center",
  }

  const $subtitle: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  }

  const $title: TextStyle = {
    fontSize: 32,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  }

  const $scrollContent: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
    paddingBottom: 120,
  }

  const $bottomArea: ViewStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    backgroundColor: `${theme.colors.bgPrimary}F0`,
  }

  const $todaySection: ViewStyle = {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  }

  const $sectionTitle: TextStyle = {
    fontSize: theme.typography.small,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  }

  const getCurrentDate = () => {
    const now = new Date()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${days[now.getDay()].toUpperCase()}, ${months[now.getMonth()].toUpperCase()} ${now.getDate()}`
  }

  return (
    <Screen>
      <View style={$container}>
        <View style={$header}>
          <IconButton icon="calendar-month" onPress={() => router.push("/calendar")} />
          
          <View style={$headerCenter}>
            <Text style={$subtitle}>{getCurrentDate()}</Text>
            <Text style={$title}>Today</Text>
          </View>

          <IconButton icon="settings" onPress={() => router.push("/settings")} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={$scrollContent}>
          <TextAreaCard
            value={text}
            onChangeText={setText}
            footerRight={<MoodRibbonPicker value={mood} onChange={setMood} />}
          />

          <MediaToolbar
            onMicPress={() => {
              if (voiceRecorder.isRecording) {
                voiceRecorder.stopRecording()
              } else {
                voiceRecorder.startRecording()
              }
            }}
            onPhotoPress={photoPicker.pickPhoto}
          />

          {(voiceRecorder.isRecording || voiceRecorder.recordedUri) && (
            <VoiceMiniRecorder
              isRecording={voiceRecorder.isRecording}
              duration={voiceRecorder.formattedDuration}
              onToggle={() => {
                if (voiceRecorder.isRecording) {
                  voiceRecorder.stopRecording()
                } else {
                  voiceRecorder.resetRecording()
                }
              }}
            />
          )}

          {photoPicker.photos.length > 0 && (
            <PhotoGrid
              photos={photoPicker.photos}
              onRemovePhoto={photoPicker.removePhoto}
              onAddPhoto={photoPicker.pickPhoto}
            />
          )}

          {todayEntries.length > 0 && (
            <View style={$todaySection}>
              <Text style={$sectionTitle}>Today's Entries</Text>
              {todayEntries.map((entry) => {
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
          )}
        </ScrollView>

        <View style={$bottomArea}>
          <PrimaryButton
            title="Add to Today"
            onPress={handleAddToToday}
            disabled={!hasContent}
          />
        </View>
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

