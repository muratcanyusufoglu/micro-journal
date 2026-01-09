import {useState} from "react";
import * as MailComposer from "expo-mail-composer";

export interface EmailOptions {
  recipients?: string[];
  subject?: string;
  body?: string;
  isHtml?: boolean;
  attachments?: string[];
}

export function useEmailComposer() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  async function checkAvailability() {
    try {
      const available = await MailComposer.isAvailableAsync();
      setIsAvailable(available);
      return available;
    } catch (error) {
      console.error("Error checking email availability:", error);
      setIsAvailable(false);
      return false;
    }
  }

  async function composeEmail(options: EmailOptions) {
    if (isAvailable === null) {
      const available = await checkAvailability();
      if (!available) {
        throw new Error("Email is not available on this device");
      }
    }

    if (isAvailable === false) {
      throw new Error("Email is not available on this device");
    }

    setIsComposing(true);

    try {
      const result = await MailComposer.composeAsync({
        recipients: options.recipients || [],
        subject: options.subject || "",
        body: options.body || "",
        isHtml: options.isHtml || false,
        attachments: options.attachments || [],
      });

      return result;
    } catch (error) {
      console.error("Error composing email:", error);
      throw error;
    } finally {
      setIsComposing(false);
    }
  }

  return {
    isAvailable,
    isComposing,
    checkAvailability,
    composeEmail,
  };
}
