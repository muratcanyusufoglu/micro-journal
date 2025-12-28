import {router} from "expo-router";
import React, {useEffect, useState} from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import {
  addPhotoEntry,
  addTextEntry,
  addVoiceEntry,
  deleteEntry,
  formatDisplayTime,
  getTodayDateKey,
  listEntriesByDate,
} from "../src/data";
import type {Entry, Mood} from "../src/data/types";
import {usePhotoPicker} from "../src/hooks/usePhotoPicker";
import {useVoicePlayer} from "../src/hooks/useVoicePlayer";
import {useVoiceRecorder} from "../src/hooks/useVoiceRecorder";
import {useTheme} from "../src/theme/ThemeProvider";
import {
  IconButton,
  MediaToolbar,
  MoodRibbonPicker,
  PhotoGrid,
  PhotoNoteCard,
  PhotoTextNoteCard,
  PrimaryButton,
  Screen,
  TextAreaCard,
  TextNoteCard,
  useToast,
  VoiceMiniRecorder,
  VoiceNoteCard,
} from "../src/ui";

export default function TodayScreen() {
  const theme = useTheme();
  const toast = useToast();
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [todayEntries, setTodayEntries] = useState<Entry[]>([]);
  const [dateKey, setDateKey] = useState("");

  const voiceRecorder = useVoiceRecorder();
  const photoPicker = usePhotoPicker();

  useEffect(() => {
    loadTodayEntries();
  }, []);

  async function loadTodayEntries() {
    const today = await getTodayDateKey();
    setDateKey(today);
    const entries = await listEntriesByDate(today);
    setTodayEntries(entries);
  }

  async function handleAddToToday() {
    if (
      !text.trim() &&
      !voiceRecorder.recordedUri &&
      photoPicker.photos.length === 0
    ) {
      return;
    }

    try {
      const hasText = !!text.trim();
      const hasPhotos = photoPicker.photos.length > 0;
      let addedCount = 0;

      // If user adds text + photos together, store as a single combined photo entry
      // (first photo gets the text; remaining photos stay photo-only)
      if (hasText && hasPhotos) {
        const [firstPhoto, ...restPhotos] = photoPicker.photos;
        await addPhotoEntry(dateKey, firstPhoto, undefined, text.trim(), mood);
        addedCount += 1;

        for (const photoUri of restPhotos) {
          await addPhotoEntry(dateKey, photoUri);
          addedCount += 1;
        }

        setText("");
        setMood(null);
        photoPicker.resetPhotos();
      } else {
        if (hasText) {
          await addTextEntry(dateKey, text.trim(), mood);
          addedCount += 1;
          setText("");
          setMood(null);
        }

        if (hasPhotos) {
          for (const photoUri of photoPicker.photos) {
            await addPhotoEntry(dateKey, photoUri);
            addedCount += 1;
          }
          photoPicker.resetPhotos();
        }
      }

      if (voiceRecorder.recordedUri) {
        await addVoiceEntry(
          dateKey,
          voiceRecorder.recordedUri,
          voiceRecorder.recordingDuration
        );
        addedCount += 1;
        voiceRecorder.resetRecording();
      }

      await loadTodayEntries();

      toast.showToast({
        title: "Added",
        message:
          addedCount === 1
            ? "Entry saved to Today"
            : `${addedCount} entries saved to Today`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding entries:", error);
      Alert.alert("Error", "Failed to add entry");
    }
  }

  async function handleDeleteEntry(entryId: number) {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(entryId);
          await loadTodayEntries();
        },
      },
    ]);
  }

  function handleEntryMenu(entry: Entry) {
    const options = ["Delete"];
    if (entry.type === "text") {
      options.unshift("Edit", "View History");
    }

    Alert.alert("Entry Options", "", [
      ...options.map((option) => ({
        text: option,
        onPress: () => {
          if (option === "Delete") {
            handleDeleteEntry(entry.id);
          } else if (option === "View History") {
            router.push(`/revision/${entry.id}`);
          } else if (option === "Edit") {
            // TODO: Open edit modal
          }
        },
      })),
      {text: "Cancel", style: "cancel"},
    ]);
  }

  const hasContent =
    text.trim() || voiceRecorder.recordedUri || photoPicker.photos.length > 0;

  const $container: ViewStyle = {
    flex: 1,
  };

  const $header: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  };

  const $headerCenter: ViewStyle = {
    flex: 1,
    alignItems: "center",
  };

  const $subtitle: TextStyle = {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  };

  const $title: TextStyle = {
    fontSize: 32,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  };

  const $scrollContent: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
    paddingBottom: 120,
  };

  const $bottomArea: ViewStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    backgroundColor: `${theme.colors.bgPrimary}F0`,
  };

  const $todaySection: ViewStyle = {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  };

  const $sectionTitle: TextStyle = {
    fontSize: theme.typography.small,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  };

  const getCurrentDate = () => {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${days[now.getDay()].toUpperCase()}, ${months[
      now.getMonth()
    ].toUpperCase()} ${now.getDate()}`;
  };

  return (
    <Screen>
      <View style={$container}>
        <View style={$header}>
          <IconButton
            icon="calendar-month"
            onPress={() => router.push("/calendar")}
          />

          <View style={$headerCenter}>
            <Text style={$subtitle}>{getCurrentDate()}</Text>
            <Text style={$title}>Today</Text>
          </View>

          <IconButton
            icon="settings"
            onPress={() => router.push("/settings")}
          />
        </View>

        <ScrollView style={{flex: 1}} contentContainerStyle={$scrollContent}>
          <TextAreaCard
            value={text}
            onChangeText={setText}
            footerRight={<MoodRibbonPicker value={mood} onChange={setMood} />}
          />

          <MediaToolbar
            onMicPress={() => {
              if (voiceRecorder.isRecording) {
                voiceRecorder.stopRecording();
              } else {
                voiceRecorder.startRecording();
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
                  voiceRecorder.stopRecording();
                } else {
                  voiceRecorder.resetRecording();
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
                  );
                }

                if (entry.type === "voice") {
                  return (
                    <VoiceNoteCardWrapper
                      key={entry.id}
                      entry={entry}
                      onMenuPress={() => handleEntryMenu(entry)}
                    />
                  );
                }

                if (entry.type === "photo") {
                  if (
                    entry.textContent &&
                    entry.textContent.trim().length > 0
                  ) {
                    return (
                      <PhotoTextNoteCard
                        key={entry.id}
                        photoUri={entry.photoUri || ""}
                        text={entry.textContent}
                        timestamp={formatDisplayTime(entry.createdAt)}
                        mood={entry.mood}
                        onMenuPress={() => handleEntryMenu(entry)}
                      />
                    );
                  }
                  return (
                    <PhotoNoteCard
                      key={entry.id}
                      photoUri={entry.photoUri || ""}
                      title={entry.photoTitle || undefined}
                      timestamp={formatDisplayTime(entry.createdAt)}
                      onMenuPress={() => handleEntryMenu(entry)}
                    />
                  );
                }

                return null;
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
  );
}

function VoiceNoteCardWrapper({
  entry,
  onMenuPress,
}: {
  entry: Entry;
  onMenuPress: () => void;
}) {
  const player = useVoicePlayer(entry.audioUri || "");

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  return (
    <VoiceNoteCard
      duration={formatDuration(entry.durationMs || 0)}
      timestamp={formatDisplayTime(entry.createdAt)}
      isPlaying={player.isPlaying}
      onPlayPause={player.togglePlayPause}
      onMenuPress={onMenuPress}
    />
  );
}
