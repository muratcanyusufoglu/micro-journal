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
    console.log("📧 emailSettings.ts: Loading from AsyncStorage, key:", EMAIL_SETTINGS_KEY);
    const stored = await AsyncStorage.getItem(EMAIL_SETTINGS_KEY);
    console.log("📧 emailSettings.ts: Raw stored data:", stored);
    
    if (!stored) {
      console.log("📧 emailSettings.ts: No stored data found, returning empty recipients");
      return {recipients: []};
    }

    const parsed: any = JSON.parse(stored);
    console.log("📧 emailSettings.ts: Parsed data:", parsed);

    if (Array.isArray(parsed.recipients)) {
      const normalized = normalizeRecipients(parsed.recipients);
      console.log("📧 emailSettings.ts: Normalized recipients:", normalized);
      return {recipients: normalized};
    }

    if (typeof parsed.defaultRecipient === "string") {
      const normalized = normalizeRecipients(parsed.defaultRecipient);
      console.log("📧 emailSettings.ts: Using defaultRecipient, normalized:", normalized);
      return {recipients: normalized};
    }

    console.log("📧 emailSettings.ts: No valid recipients found in parsed data, returning empty");
    return {recipients: []};
  } catch (error) {
    console.error("📧 emailSettings.ts: Error loading email settings:", error);
    return {recipients: []};
  }
}

export async function saveEmailSettings(settings: EmailSettings): Promise<void> {
  try {
    const normalized = normalizeRecipients(settings.recipients);
    console.log("📧 emailSettings.ts: Saving to AsyncStorage, key:", EMAIL_SETTINGS_KEY);
    console.log("📧 emailSettings.ts: Normalized recipients:", normalized);
    const dataToSave = {recipients: normalized};
    const jsonString = JSON.stringify(dataToSave);
    console.log("📧 emailSettings.ts: JSON string to save:", jsonString);
    
    await AsyncStorage.setItem(EMAIL_SETTINGS_KEY, jsonString);
    
    // Verify it was saved
    const verification = await AsyncStorage.getItem(EMAIL_SETTINGS_KEY);
    console.log("📧 emailSettings.ts: Verification - saved data:", verification);
    
    if (!verification) {
      throw new Error("Failed to save email settings - verification failed");
    }
  } catch (error) {
    console.error("📧 emailSettings.ts: Error saving email settings:", error);
    throw error;
  }
}

