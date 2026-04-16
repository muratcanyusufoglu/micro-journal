import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Keyboard, ScrollView, View, ViewStyle } from "react-native";
import type { Mood, ShareData } from "../data/types";
import { useTheme } from "../theme/ThemeProvider";
import { MoodRibbonPicker } from "./MoodRibbonPicker";
import { PhotoGrid } from "./PhotoGrid";
import { PrimaryButton } from "./PrimaryButton";
import { TextAreaCard } from "./TextAreaCard";

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

  async function handlePickPhoto() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        
        // React Native Image component can handle URIs with or without file:// prefix
        // But we'll keep the original URI format from ImagePicker
        // Check if photo is already in the list (avoid duplicates)
        if (!photos.includes(uri)) {
          setPhotos((prev) => [...prev, uri]);
        }
      }
    } catch (error) {
      console.error("Error picking photo:", error);
    }
  }

  function handleSave() {
    if (!text.trim() && photos.length === 0) return;
    Keyboard.dismiss();
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

        <PhotoGrid
          photos={photos}
          onRemovePhoto={handleRemovePhoto}
          onAddPhoto={handlePickPhoto}
        />
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
