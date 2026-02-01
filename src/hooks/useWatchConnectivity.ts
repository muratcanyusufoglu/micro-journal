import {useEffect, useState} from "react";

// Lazy load watch connectivity module to handle cases where native module is not available
let watchEvents: any = null;
let sendMessage: any = null;

try {
  const watchModule = require("react-native-watch-connectivity");
  // The module exports watchEvents as default and sendMessage as named export
  watchEvents = watchModule.default || watchModule.watchEvents;
  sendMessage = watchModule.sendMessage;
  console.log("Watch connectivity module loaded:", {
    hasWatchEvents: !!watchEvents,
    hasSendMessage: !!sendMessage,
    watchEventsKeys: watchEvents ? Object.keys(watchEvents) : [],
  });
} catch (error) {
  console.warn("Watch connectivity module not available:", error);
}

interface WatchQuickNotePayload {
  type: "quick-note";
  timestamp: number;
  mood?: string;
}

type IncomingMessage = WatchQuickNotePayload | Record<string, unknown>;

type MessageHandler = (message: WatchQuickNotePayload, replyHandler?: ((reply: any) => void) | null) => void;

export function useWatchConnectivity(onMessage?: MessageHandler) {
  const [isReachable, setIsReachable] = useState(false);

  useEffect(() => {
    console.log("useWatchConnectivity: Initializing...");
    console.log("useWatchConnectivity: watchEvents available?", !!watchEvents);
    console.log("useWatchConnectivity: watchEvents type:", typeof watchEvents);
    
    if (!watchEvents) {
      console.warn("Watch connectivity not available - native module not linked. Run 'pod install' in ios/ directory.");
      setIsReachable(false);
      return;
    }

    try {
      console.log("useWatchConnectivity: Setting up message listener...");
      
      if (!watchEvents || typeof watchEvents.addListener !== "function") {
        console.error("useWatchConnectivity: watchEvents.addListener is not available. watchEvents:", watchEvents);
        return;
      }
      
      console.log("useWatchConnectivity: Using addListener API");
      
      // Listen for direct messages (sendMessage)
      const unsubscribeMessage = watchEvents.addListener(
        "message",
        (payload: IncomingMessage, replyHandler: ((reply: any) => void) | null) => {
          console.log("useWatchConnectivity: [MESSAGE] Received:", JSON.stringify(payload));
          console.log("useWatchConnectivity: [MESSAGE] Reply handler available:", !!replyHandler);
          
          if (payload && (payload as WatchQuickNotePayload).type === "quick-note") {
            console.log("useWatchConnectivity: [MESSAGE] Quick-note detected, calling handler");
            if (onMessage) {
              onMessage(payload as WatchQuickNotePayload, replyHandler);
            } else {
              console.warn("useWatchConnectivity: [MESSAGE] No message handler provided");
            }
          } else {
            console.log("useWatchConnectivity: [MESSAGE] Message is not a quick-note:", payload);
          }

          // Always reply if handler is available
          if (replyHandler && typeof replyHandler === "function") {
            console.log("useWatchConnectivity: [MESSAGE] Sending reply");
            replyHandler({status: "ok"});
          }
        }
      );
      
      // Listen for user-info transfers (transferUserInfo fallback)
      const unsubscribeUserInfo = watchEvents.addListener(
        "user-info",
        (payloads: IncomingMessage[]) => {
          console.log("useWatchConnectivity: [USER-INFO] Received:", JSON.stringify(payloads));
          
          // user-info can contain multiple payloads
          for (const payload of payloads) {
            if (payload && (payload as WatchQuickNotePayload).type === "quick-note") {
              console.log("useWatchConnectivity: [USER-INFO] Quick-note detected, calling handler");
              if (onMessage) {
                // user-info doesn't have reply handler
                onMessage(payload as WatchQuickNotePayload, null);
              }
            }
          }
        }
      );
      
      const unsubscribe = () => {
        unsubscribeMessage();
        unsubscribeUserInfo();
      };

      // Check reachability
      if (watchEvents.once && typeof watchEvents.once === "function") {
        watchEvents.once("reachability")
          .then((reachable: boolean) => {
            console.log("useWatchConnectivity: Reachability check:", reachable);
            setIsReachable(reachable);
          })
          .catch((err: any) => {
            console.warn("useWatchConnectivity: Failed to check watch reachability:", err);
            setIsReachable(false);
          });
      }

      return () => {
        console.log("useWatchConnectivity: Cleaning up listener");
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error("useWatchConnectivity: Error setting up watch connectivity listener:", error);
      setIsReachable(false);
    }
  }, [onMessage]);

  function sendPing() {
    if (!sendMessage || !watchEvents) {
      console.warn("Watch connectivity not available - native module not linked");
      return;
    }
    try {
      sendMessage({type: "ping", timestamp: Date.now()});
    } catch (error) {
      console.error("Error sending watch message:", error);
    }
  }

  return {
    isReachable,
    sendPing,
  };
}
