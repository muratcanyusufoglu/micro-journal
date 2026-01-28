import React from "react";
import {router} from "expo-router";
import {QRScannerScreen} from "../src/ui/QRScannerScreen";
import {useToast} from "../src/ui";
import {addTextEntry, getTodayDateKey} from "../src/data";
import * as Haptics from "expo-haptics";

export default function QRScanRoute() {
  const toast = useToast();

  async function handleQRScanned(data: string) {
    try {
      console.log("QR Code data:", data);
      
      const dateKey = await getTodayDateKey();
      await addTextEntry(dateKey, `QR Code: ${data}`, null);

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      toast.showToast({
        title: "QR Code Saved",
        message: "QR code data added to Today",
        variant: "success",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast.showToast({
        title: "Error",
        message: "Failed to save QR code data",
        variant: "error",
      });
    }
  }

  function handleCancel() {
    router.back();
  }

  return (
    <QRScannerScreen
      onScanned={handleQRScanned}
      onCancel={handleCancel}
    />
  );
}
