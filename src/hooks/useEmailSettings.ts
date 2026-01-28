import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EMAIL_SETTINGS_KEY = "@oneline:email_settings";

export interface EmailSettingsState {
  recipients: string[];
}

interface UseEmailSettingsResult {
  recipients: string[];
  isLoading: boolean;
  addRecipient: (email: string) => Promise<void>;
  removeRecipient: (email: string) => Promise<void>;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function useEmailSettings(): UseEmailSettingsResult {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(EMAIL_SETTINGS_KEY);
      if (!stored) {
        setRecipients([]);
        return;
      }

      const parsed = JSON.parse(stored) as
        | {recipients?: string[]; defaultRecipient?: string}
        | string;

      let next: string[] = [];

      if (typeof parsed === "string") {
        next = parsed
          .split(",")
          .map(normalizeEmail)
          .filter((x) => x.length > 0);
      } else {
        if (Array.isArray(parsed.recipients) && parsed.recipients.length > 0) {
          next = parsed.recipients.map(normalizeEmail);
        } else if (parsed.defaultRecipient) {
          next = parsed.defaultRecipient
            .split(",")
            .map(normalizeEmail)
            .filter((x) => x.length > 0);
        }
      }

      setRecipients(Array.from(new Set(next)));
    } catch (error) {
      console.error("Error loading email settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function persist(next: string[]) {
    setRecipients(next);
    const payload: EmailSettingsState = {recipients: next};
    await AsyncStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(payload));
  }

  async function addRecipient(email: string) {
    const value = normalizeEmail(email);
    if (!value) return;
    const next = Array.from(new Set([...recipients, value]));
    await persist(next);
  }

  async function removeRecipient(email: string) {
    const value = normalizeEmail(email);
    const next = recipients.filter((r) => r !== value);
    await persist(next);
  }

  return {
    recipients,
    isLoading,
    addRecipient,
    removeRecipient,
  };
}

