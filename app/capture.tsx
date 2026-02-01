import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
    addPhotoEntry,
    addTextEntry,
    getTodayDateKey,
} from "../src/data";
import type { Mood, ShareData } from "../src/data/types";
import { useToast } from "../src/ui";
import { CaptureScreen } from "../src/ui/CaptureScreen";
import { Screen } from "../src/ui/Screen";

export default function CaptureScreenRoute() {
  const params = useLocalSearchParams();
  const toast = useToast();

  function parseShareData(): ShareData {
    const text = (params.text as string) || undefined;
    const url = (params.url as string) || undefined;
    const imageUri = (params.imageUri as string) || undefined;
    const imageUris = params.imageUris
      ? (params.imageUris as string).split(",")
      : undefined;

    let type: ShareData["type"] = "text";
    if (imageUri || imageUris) {
      type = "image";
    } else if (url) {
      type = "url";
    }

    const shareData = {
      text: text || url,
      url,
      imageUri,
      imageUris,
      type,
    };
    
    return shareData;
  }

  async function handleSave(
    text: string,
    mood: Mood | null,
    photos: string[]
  ) {
    try {
      const dateKey = await getTodayDateKey();
      let savedCount = 0;

      if (text.trim() && photos.length > 0) {
        const [firstPhoto, ...restPhotos] = photos;
        await addPhotoEntry(dateKey, firstPhoto, undefined, text.trim(), mood);
        savedCount += 1;

        for (const photoUri of restPhotos) {
          await addPhotoEntry(dateKey, photoUri);
          savedCount += 1;
        }
      } else if (text.trim()) {
        await addTextEntry(dateKey, text.trim(), mood);
        savedCount += 1;
      } else if (photos.length > 0) {
        for (const photoUri of photos) {
          await addPhotoEntry(dateKey, photoUri);
          savedCount += 1;
        }
      }

      if (savedCount > 0) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );

        toast.showToast({
          title: "Saved",
          message:
            savedCount === 1
              ? "Entry added to Today"
              : `${savedCount} entries added to Today`,
          variant: "success",
        });

        setTimeout(() => {
          router.replace("/");
        }, 500);
      }
    } catch (error) {
      console.error("Error saving capture:", error);
      toast.showToast({
        title: "Error",
        message: "Failed to save entry",
        variant: "error",
      });
    }
  }

  function handleCancel() {
    router.back();
  }

  const shareData = parseShareData();

  return (
    <Screen>
      <CaptureScreen
        shareData={shareData}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Screen>
  );
}
