import React, {useState, useEffect} from "react";
import {View, ViewStyle, ScrollView} from "react-native";
import {useTheme} from "../theme/ThemeProvider";
import {TextAreaCard} from "./TextAreaCard";
import {MoodRibbonPicker} from "./MoodRibbonPicker";
import {PrimaryButton} from "./PrimaryButton";
import {PhotoGrid} from "./PhotoGrid";
import type {ShareData, Mood} from "../data/types";

interface CaptureScreenProps {
  shareData: ShareData;
  onSave: (text: string, mood: Mood | null, photos: string[]) => void;
  onCancel?: () => void;
}

export function CaptureScreen({
  shareData,
  onSave,
  onCancel,
}: CaptureScreenProps) {
  const theme = useTheme();
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let initialText = "";

    if (shareData.text) {
      initialText = shareData.text;
    } else if (shareData.url) {
      initialText = shareData.url;
    }

    if (shareData.imageUri) {
      setPhotos([shareData.imageUri]);
    } else if (shareData.imageUris) {
      setPhotos(shareData.imageUris);
    }

    setText(initialText);
  }, [shareData]);

  function handleSave() {
    if (!text.trim() && photos.length === 0) return;
    onSave(text.trim(), mood, photos);
  }

  function handleRemovePhoto(index: number) {
    setPhotos(photos.filter((_, i) => i !== index));
  }

  const $container: ViewStyle = {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  };

  const $content: ViewStyle = {
    flex: 1,
    gap: theme.spacing.md,
  };

  const $buttonContainer: ViewStyle = {
    paddingTop: theme.spacing.sm,
  };

  const hasContent = text.trim() || photos.length > 0;

  return (
    <View style={$container}>
      <ScrollView
        style={$content}
        contentContainerStyle={{gap: theme.spacing.md}}
        keyboardShouldPersistTaps="handled"
      >
        <TextAreaCard
          value={text}
          onChangeText={setText}
          placeholder="Edit your note..."
          minHeight={200}
          footerRight={<MoodRibbonPicker value={mood} onChange={setMood} />}
        />

        {photos.length > 0 && (
          <PhotoGrid
            photos={photos}
            onRemovePhoto={handleRemovePhoto}
            onAddPhoto={() => {
              // Photo picker can be added later if needed
            }}
          />
        )}
      </ScrollView>

      <View style={$buttonContainer}>
        <PrimaryButton
          title="Save"
          onPress={handleSave}
          disabled={!hasContent}
        />
      </View>
    </View>
  );
}
