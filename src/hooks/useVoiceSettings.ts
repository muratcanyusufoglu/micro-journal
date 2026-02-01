import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VOICE_SETTINGS_KEY = "@oneline:voice_settings";

interface VoiceSettingsState {
  autoTranscribe: boolean;
}

interface UseVoiceSettingsResult extends VoiceSettingsState {
  isLoading: boolean;
  setAutoTranscribe: (value: boolean) => Promise<void>;
}

export function useVoiceSettings(): UseVoiceSettingsResult {
  const [autoTranscribe, setAutoTranscribeState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(VOICE_SETTINGS_KEY);
      if (!stored) {
        setAutoTranscribeState(false);
        return;
      }

      const parsed: Partial<VoiceSettingsState> = JSON.parse(stored);
      setAutoTranscribeState(!!parsed.autoTranscribe);
    } catch (error) {
      console.error("Error loading voice settings:", error);
      setAutoTranscribeState(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function setAutoTranscribe(value: boolean) {
    try {
      setAutoTranscribeState(value);
      const payload: VoiceSettingsState = {autoTranscribe: value};
      await AsyncStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Error saving voice settings:", error);
    }
  }

  return {
    autoTranscribe,
    isLoading,
    setAutoTranscribe,
  };
}

