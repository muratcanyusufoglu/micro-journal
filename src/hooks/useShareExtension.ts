import { useEffect, useCallback } from "react";
import { NativeModules, Platform } from "react-native";

interface SharedData {
  text?: string;
  url?: string;
  imageUris?: string[];
  timestamp: number;
}

interface UseShareExtensionOptions {
  onDataReceived: (data: SharedData) => Promise<void>;
}

// Lazy load the native module
let ShareExtensionBridge: any = null;
if (Platform.OS === "ios") {
  try {
    ShareExtensionBridge = NativeModules.ShareExtensionBridge;
  } catch (error) {
    console.warn("ShareExtensionBridge native module not available:", error);
  }
}

/**
 * Hook to check for pending share extension data
 * This reads data from App Groups SharedUserDefaults via native module
 */
export function useShareExtension({ onDataReceived }: UseShareExtensionOptions) {
  const checkForPendingShare = useCallback(async () => {
    if (!ShareExtensionBridge) {
      console.log("📱 ShareExtensionBridge not available (not iOS or module not linked)");
      return;
    }

    try {
      console.log("📱 Checking for pending share data...");
      
      const shareData = await ShareExtensionBridge.checkPendingShare();
      
      if (!shareData) {
        console.log("📱 No pending share data found");
        return;
      }

      console.log("✅ Found pending share data:", shareData);
      
      // Process the data
      await onDataReceived(shareData as SharedData);
      
      // Clear the pending share after processing
      await ShareExtensionBridge.clearPendingShare();
      console.log("✅ Pending share data processed and cleared");
      
    } catch (error) {
      console.error("❌ Error checking for pending share:", error);
    }
  }, [onDataReceived]);

  useEffect(() => {
    // Check on mount
    checkForPendingShare();
  }, [checkForPendingShare]);

  return {
    checkForPendingShare,
  };
}
