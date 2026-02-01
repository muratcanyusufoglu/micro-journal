import AsyncStorage from "@react-native-async-storage/async-storage";

const EMAIL_SETTINGS_KEY = "@oneline:email_settings";

export interface EmailSettings {
  recipients: string[];
}

function normalizeRecipients(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter((r) => !!r && r.trim().length > 0);
  return input
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
}

export async function loadEmailSettings(): Promise<EmailSettings> {
  try {
    const stored = await AsyncStorage.getItem(EMAIL_SETTINGS_KEY);
    
    if (!stored) {
      return {recipients: []};
    }

    const parsed: any = JSON.parse(stored);

    if (Array.isArray(parsed.recipients)) {
      const normalized = normalizeRecipients(parsed.recipients);
      return {recipients: normalized};
    }

    if (typeof parsed.defaultRecipient === "string") {
      const normalized = normalizeRecipients(parsed.defaultRecipient);
      return {recipients: normalized};
    }

    return {recipients: []};
  } catch (error) {
    console.error("Error loading email settings:", error);
    return {recipients: []};
  }
}

export async function saveEmailSettings(settings: EmailSettings): Promise<void> {
  try {
    const normalized = normalizeRecipients(settings.recipients);
    const dataToSave = {recipients: normalized};
    const jsonString = JSON.stringify(dataToSave);
    
    await AsyncStorage.setItem(EMAIL_SETTINGS_KEY, jsonString);
    
    // Verify it was saved
    const verification = await AsyncStorage.getItem(EMAIL_SETTINGS_KEY);
    
    if (!verification) {
      throw new Error("Failed to save email settings - verification failed");
    }
  } catch (error) {
    console.error("Error saving email settings:", error);
    throw error;
  }
}

