import {MaterialIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import React, {useEffect, useState} from "react";
import {
  Alert,
  InputAccessoryView,
  Keyboard,
  KeyboardEvent,
  Platform,
  Pressable,
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
  buildSingleEntryEmailPayload,
  getTodayDateKey,
  listEntriesByDate,
  updateTextEntry,
  updateVoiceEntryTranscription,
} from "../src/data";
import type {Entry, Mood} from "../src/data/types";
import {useEmailComposer} from "../src/hooks/useEmailComposer";
import {usePhotoPicker} from "../src/hooks/usePhotoPicker";
import {useVoicePlayer} from "../src/hooks/useVoicePlayer";
import {useVoiceRecorder} from "../src/hooks/useVoiceRecorder";
import {useSpeechRecognition} from "../src/hooks/useSpeechRecognition";
import {useTheme} from "../src/theme/ThemeProvider";
import {
  ActionSheet,
  EmailComposerSheet,
  IconButton,
  MediaToolbar,
  MoodRibbonPicker,
  PhotoGrid,
  PhotoNoteCard,
  PhotoTextNoteCard,
  PrimaryButton,
  Screen,
  TextAreaCard,
  TextEditorSheet,
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [menuEntry, setMenuEntry] = useState<Entry | null>(null);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const emailComposer = useEmailComposer();

  const voiceRecorder = useVoiceRecorder();
  const photoPicker = usePhotoPicker();
  const saveAccessoryId = "oneline-save-accessory";
  const isIOS = (Platform.OS as string) === "ios";

  useEffect(() => {
    loadTodayEntries();
  }, []);

  useEffect(() => {
    function onKeyboardShow(e: KeyboardEvent) {
      setIsKeyboardVisible(true);
      if (!isIOS) setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardHide() {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    }

    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      onKeyboardShow
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      onKeyboardHide
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
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
      !voiceRecorder.isRecording &&
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

      if (voiceRecorder.isRecording || voiceRecorder.recordedUri) {
        const result = await voiceRecorder.stopRecording();
        if (result.uri) {
          await addVoiceEntry(
            dateKey,
            result.uri,
            voiceRecorder.recordingDuration,
            result.transcription || null
          );
          addedCount += 1;
        }
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
    setMenuEntry(entry);
  }

  const hasContent =
    text.trim() || voiceRecorder.recordedUri || photoPicker.photos.length > 0;
  const isAndroidKeyboardVisible =
    !isIOS && isKeyboardVisible && keyboardHeight > 0;

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

  const $keyboardSaveWrap: ViewStyle = {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: keyboardHeight,
    alignItems: "flex-end",
  };

  const $keyboardSaveButton: ViewStyle = {
    height: 44,
    minWidth: 108,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 22,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...theme.shadows.soft,
  };

  const $keyboardSaveText: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  };

  const $accessoryWrap: ViewStyle = {
    backgroundColor: `${theme.colors.bgPrimary}F0`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    alignItems: "flex-end",
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
                      setEditEntry(menuEntry);
                    },
                  },
                  {
                    label: "View History",
                    icon: "history",
                    onPress: () => {
                      if (!menuEntry) return;
                      router.push(`/revision/${menuEntry.id}`);
                    },
                  },
                ]
              : []),
            {
              label: "Send via Email",
              icon: "email",
              onPress: () => {
                if (!menuEntry) return;
                setShowEmailComposer(true);
              },
            },
            {
              label: "Delete",
              icon: "delete-outline",
              variant: "destructive",
              onPress: () => {
                if (!menuEntry) return;
                handleDeleteEntry(menuEntry.id);
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
            if (!editEntry) return;
            await updateTextEntry(editEntry.id, nextText, nextMood ?? null);
            await loadTodayEntries();
            toast.showToast({title: "Saved", message: "Entry updated"});
          }}
        />

        <EmailComposerSheet
          visible={showEmailComposer}
          onClose={() => {
            setShowEmailComposer(false);
            setMenuEntry(null);
          }}
          defaultBody={menuEntry ? buildSingleEntryEmailPayload(menuEntry).body : ""}
          defaultSubject={
            menuEntry ? buildSingleEntryEmailPayload(menuEntry).subject : ""
          }
          onSend={async (recipients, subject, body) => {
            try {
              const attachments = menuEntry
                ? buildSingleEntryEmailPayload(menuEntry).attachments
                : undefined;

              await emailComposer.composeEmail({
                recipients,
                subject,
                body,
                attachments,
              });
              setShowEmailComposer(false);
              setMenuEntry(null);
              toast.showToast({
                title: "Email Opened",
                message: "Email composer opened",
              });
            } catch (error) {
              console.error("Error sending email:", error);
              toast.showToast({
                title: "Error",
                message: "Failed to open email composer",
                variant: "error",
              });
            }
          }}
        />

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
            inputAccessoryViewID={isIOS ? saveAccessoryId : undefined}
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
            onQRPress={() => router.push("/qr-scan")}
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

        {isAndroidKeyboardVisible && (
          <View pointerEvents="box-none" style={$keyboardSaveWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save entry"
              onPress={handleAddToToday}
              disabled={!hasContent}
              style={({pressed}) => [
                $keyboardSaveButton,
                {
                  opacity: !hasContent ? 0.45 : pressed ? 0.75 : 1,
                },
              ]}
            >
              <MaterialIcons
                name="check"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={$keyboardSaveText}>Save</Text>
            </Pressable>
          </View>
        )}

        {isIOS && isKeyboardVisible && (
          <InputAccessoryView nativeID={saveAccessoryId}>
            <View style={$accessoryWrap}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save entry"
                onPress={handleAddToToday}
                disabled={!hasContent}
                style={({pressed}) => [
                  $keyboardSaveButton,
                  {
                    opacity: !hasContent ? 0.45 : pressed ? 0.75 : 1,
                  },
                ]}
              >
                <MaterialIcons
                  name="check"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <Text style={$keyboardSaveText}>Save</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        )}
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
  const speechRecognition = useSpeechRecognition();
  const toast = useToast();

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  async function handleTranscribe() {
    if (!entry.audioUri) return;

    if (!speechRecognition.isAvailable) {
      toast.showToast({
        title: "Speech Recognition Unavailable",
        message: "Please rebuild the app to enable voice transcription",
        variant: "error",
      });
      return;
    }

    try {
      toast.showToast({
        title: "Transcribing...",
        message: "Converting voice to text",
        variant: "info",
      });

      // Start speech recognition
      await speechRecognition.startListening();

      // Play the audio
      await player.play();

      // Wait for transcription to complete (max duration of audio + 5 seconds)
      const maxWait = (entry.durationMs || 30000) + 5000;
      const startTime = Date.now();
      
      while (speechRecognition.isListening && Date.now() - startTime < maxWait) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await speechRecognition.stopListening();
      await player.pause();

      if (speechRecognition.transcript && speechRecognition.transcript.trim()) {
        await updateVoiceEntryTranscription(entry.id, speechRecognition.transcript.trim());
        toast.showToast({
          title: "Transcribed",
          message: "Voice note converted to text",
          variant: "success",
        });
        // Reload entries to show transcription
        // This will be handled by parent component
      } else {
        toast.showToast({
          title: "No text detected",
          message: "Could not transcribe this voice note",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Transcription error:", error);
      await speechRecognition.stopListening();
      await player.pause();
      toast.showToast({
        title: "Error",
        message: speechRecognition.error || "Failed to transcribe voice note",
        variant: "error",
      });
    }
  }

  return (
    <VoiceNoteCard
      duration={formatDuration(entry.durationMs || 0)}
      timestamp={formatDisplayTime(entry.createdAt)}
      isPlaying={player.isPlaying}
      transcription={entry.transcription}
      onPlayPause={player.togglePlayPause}
      onMenuPress={onMenuPress}
      onTranscribe={entry.transcription ? undefined : handleTranscribe}
    />
  );
}
