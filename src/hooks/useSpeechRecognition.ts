import {useEffect, useState, useRef} from "react";
import {Platform} from "react-native";

// Lazy load Voice module to handle cases where native module is not available
let Voice: any = null;
try {
  Voice = require("@react-native-voice/voice").default;
} catch (error) {
  console.warn("Voice module not available:", error);
}

interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isAvailable: boolean;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: "",
    error: null,
    isAvailable: false,
  });

  const recognitionRef = useRef<boolean>(false);

  useEffect(() => {
    if (!Voice) {
      setState((prev) => ({
        ...prev,
        isAvailable: false,
        error: "Speech recognition module not available. Please rebuild the app.",
      }));
      return;
    }

    // Check availability
    Voice.isAvailable()
      .then((available: boolean) => {
        setState((prev) => ({...prev, isAvailable: available}));
      })
      .catch((err: any) => {
        console.error("Speech recognition not available:", err);
        setState((prev) => ({...prev, isAvailable: false}));
      });

    // Set up event handlers
    Voice.onSpeechStart = () => {
      setState((prev) => ({...prev, isListening: true, error: null}));
    };

    Voice.onSpeechEnd = () => {
      setState((prev) => ({...prev, isListening: false}));
    };

    Voice.onSpeechError = (e: any) => {
      console.error("Speech recognition error:", e);
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: e.error?.message || "Speech recognition failed",
      }));
    };

    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        const transcript = e.value[0];
        setState((prev) => ({
          ...prev,
          transcript,
          isListening: false,
        }));
      }
    };

    Voice.onSpeechPartialResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        setState((prev) => ({
          ...prev,
          transcript: e.value[0],
        }));
      }
    };

    return () => {
      if (Voice) {
        Voice.destroy().then(() => Voice.removeAllListeners());
      }
    };
  }, []);

  async function startListening(language?: string) {
    if (!Voice) {
      setState((prev) => ({
        ...prev,
        error: "Speech recognition module not available. Please rebuild the app.",
        isListening: false,
      }));
      return;
    }

    try {
      setState((prev) => ({...prev, transcript: "", error: null}));
      
      const defaultLanguage = language || (Platform.OS === "ios" ? "en-US" : "en-US");
      
      await Voice.start(defaultLanguage);
      recognitionRef.current = true;
    } catch (error: any) {
      console.error("Failed to start speech recognition:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to start listening",
        isListening: false,
      }));
    }
  }

  async function stopListening() {
    if (!Voice) {
      return;
    }

    try {
      await Voice.stop();
      recognitionRef.current = false;
    } catch (error: any) {
      console.error("Failed to stop speech recognition:", error);
    }
  }

  function reset() {
    setState({
      isListening: false,
      transcript: "",
      error: null,
      isAvailable: state.isAvailable,
    });
  }

  return {
    ...state,
    startListening,
    stopListening,
    reset,
  };
}
