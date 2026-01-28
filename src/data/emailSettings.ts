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
      return {recipients: normalizeRecipients(parsed.recipients)};
    }

    if (typeof parsed.defaultRecipient === "string") {
      return {recipients: normalizeRecipients(parsed.defaultRecipient)};
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
    await AsyncStorage.setItem(
      EMAIL_SETTINGS_KEY,
      JSON.stringify({recipients: normalized})
    );
  } catch (error) {
    console.error("Error saving email settings:", error);
  }
}

