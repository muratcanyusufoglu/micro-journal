import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { addTextEntry, getTodayDateKey } from "../src/data";
import { useToast } from "../src/ui";
import { QRScannerScreen } from "../src/ui/QRScannerScreen";

export default function QRScanRoute() {
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleQRScanned(data: string) {
    if (isProcessing) return; // Prevent multiple scans
    
    setIsProcessing(true);
    
    try {
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

      // Navigate to home screen immediately to refresh entries
      router.replace("/");
    } catch (error) {
      console.error("Error saving QR code:", error);
      setIsProcessing(false); // Allow retry on error
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
