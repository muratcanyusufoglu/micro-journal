import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus, NativeModules, Platform } from "react-native";

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
    console.log("📱 ShareExtensionBridge module loaded:", !!ShareExtensionBridge);
  } catch (error) {
    console.warn("ShareExtensionBridge native module not available:", error);
  }
}

/**
 * Hook to check for pending share extension data
 * This reads data from App Groups SharedUserDefaults via native module
 * Also checks when app comes to foreground (after Share Extension opens app)
 */
export function useShareExtension({ onDataReceived }: UseShareExtensionOptions) {
  const isProcessingRef = useRef(false);

  const checkForPendingShare = useCallback(async () => {
    if (!ShareExtensionBridge) {
      console.log("📱 ShareExtensionBridge not available (not iOS or module not linked)");
      return;
    }

    // Prevent multiple simultaneous checks
    if (isProcessingRef.current) {
      console.log("📱 Share Extension: Already processing, skipping...");
      return;
    }

    try {
      isProcessingRef.current = true;
      console.log("📱 Checking for pending share data...");
      
      const shareData = await ShareExtensionBridge.checkPendingShare();
      
      if (!shareData) {
        console.log("📱 No pending share data found");
        isProcessingRef.current = false;
        return;
      }

      console.log("✅ Found pending share data:", shareData);
      
      // Process the data
      await onDataReceived(shareData as SharedData);
      
      // Clear the pending share after processing
      await ShareExtensionBridge.clearPendingShare();
      console.log("✅ Pending share data processed and cleared");
      
      isProcessingRef.current = false;
    } catch (error) {
      console.error("❌ Error checking for pending share:", error);
      isProcessingRef.current = false;
    }
  }, [onDataReceived]);

  useEffect(() => {
    // Check on mount
    checkForPendingShare();

    // Also check when app comes to foreground (Share Extension opens app)
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("📱 App became active, checking for share data...");
        // Longer delay to ensure Share Extension has finished writing to UserDefaults
        setTimeout(() => {
          checkForPendingShare();
        }, 1000);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkForPendingShare]);

  return {
    checkForPendingShare,
    clearPendingShare: async () => {
      if (ShareExtensionBridge) {
        try {
          await ShareExtensionBridge.clearPendingShare();
        } catch (error) {
          console.error("Error clearing pending share:", error);
        }
      }
    },
  };
}
