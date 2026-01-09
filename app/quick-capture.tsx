import React from "react";
import {useLocalSearchParams, router} from "expo-router";
import {Screen} from "../src/ui/Screen";
import {QuickCaptureScreen} from "../src/ui/QuickCaptureScreen";
import {useToast} from "../src/ui";
import {addTextEntry, getTodayDateKey} from "../src/data";
import * as Haptics from "expo-haptics";

export default function QuickCaptureScreenRoute() {
  const params = useLocalSearchParams();
  const toast = useToast();
  const initialText = (params.text as string) || "";

  async function handleSave(text: string) {
    try {
      const dateKey = await getTodayDateKey();
      await addTextEntry(dateKey, text);

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      toast.showToast({
        title: "Saved",
        message: "Note added to Today",
        variant: "success",
      });

      setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch (error) {
      console.error("Error saving quick capture:", error);
      toast.showToast({
        title: "Error",
        message: "Failed to save note",
        variant: "error",
      });
    }
  }

  function handleCancel() {
    router.back();
  }

  return (
    <Screen>
      <QuickCaptureScreen
        initialText={initialText}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Screen>
  );
}
