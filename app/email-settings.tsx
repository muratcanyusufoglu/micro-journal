import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import { loadEmailSettings, saveEmailSettings } from "../src/data";
import { useTheme } from "../src/theme/ThemeProvider";
import { AppHeader, Card, PrimaryButton, Screen } from "../src/ui";

export default function EmailSettingsScreen() {
  const theme = useTheme();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const settings = await loadEmailSettings();
      console.log("📧 EmailSettings: Loaded settings:", settings);
      console.log("📧 EmailSettings: Recipients count:", settings.recipients.length);
      setRecipients(settings.recipients);
    } catch (error) {
      console.error("📧 EmailSettings: Error loading email settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings() {
    try {
      console.log("📧 EmailSettings: saveSettings called");
      console.log("📧 EmailSettings: Saving recipients:", recipients);
      console.log("📧 EmailSettings: Recipients length:", recipients.length);
      
      if (recipients.length === 0) {
        Alert.alert("No Recipients", "Please add at least one email address before saving");
        return;
      }
      
      await saveEmailSettings({recipients});
      console.log("📧 EmailSettings: Settings saved successfully");
      
      // Verify it was saved
      const saved = await loadEmailSettings();
      console.log("📧 EmailSettings: Verified saved settings:", saved);
      console.log("📧 EmailSettings: Verified recipients count:", saved.recipients.length);
      
      if (saved.recipients.length === 0) {
        Alert.alert("Warning", "Settings were saved but could not be verified. Please try again.");
        return;
      }
      
      Alert.alert("Saved", "Email settings saved successfully");
    } catch (error) {
      console.error("📧 EmailSettings: Error saving email settings:", error);
      Alert.alert("Error", `Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const $container: ViewStyle = {
    flex: 1,
  };

  const $scrollContent: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  };

  const $card: ViewStyle = {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  };

  const $inputContainer: ViewStyle = {
    gap: theme.spacing.sm,
  };

  const $label: TextStyle = {
    fontSize: theme.typography.small,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  };

  const $input: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
    minHeight: 44,
  };

  const $buttonContainer: ViewStyle = {
    marginTop: theme.spacing.md,
  };

  const $recipientRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.xs,
  };

  const $recipientText: TextStyle = {
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
  };

  const $removeText: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  };

  async function handleAddRecipient() {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    if (!email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address");
      return;
    }

    if (recipients.includes(email)) {
      Alert.alert("Already added", "This email is already in your list");
      return;
    }

    const updatedRecipients = [...recipients, email];
    console.log("📧 EmailSettings: Adding recipient:", email);
    console.log("📧 EmailSettings: Updated recipients:", updatedRecipients);
    setRecipients(updatedRecipients);
    setNewEmail("");

    // Auto-save after adding
    try {
      await saveEmailSettings({recipients: updatedRecipients});
      console.log("📧 EmailSettings: Auto-saved after adding recipient");
    } catch (error) {
      console.error("📧 EmailSettings: Error auto-saving:", error);
      Alert.alert("Error", "Failed to save email. Please try again.");
    }
  }

  async function handleRemoveRecipient(email: string) {
    const updatedRecipients = recipients.filter((r) => r !== email);
    setRecipients(updatedRecipients);

    // Auto-save after removing
    try {
      await saveEmailSettings({recipients: updatedRecipients});
      console.log("📧 EmailSettings: Auto-saved after removing recipient");
    } catch (error) {
      console.error("📧 EmailSettings: Error auto-saving:", error);
      Alert.alert("Error", "Failed to save changes. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <Screen>
        <AppHeader
          title="Email Settings"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={$container}>
        <AppHeader
          title="Email Settings"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />

        <ScrollView contentContainerStyle={$scrollContent}>
          <Card style={$card}>
            <View style={$inputContainer}>
              <Text style={$label}>Add Recipient</Text>
              <TextInput
                style={$input}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="email@example.com"
                placeholderTextColor={theme.colors.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <PrimaryButton
                title="Add"
                onPress={handleAddRecipient}
                disabled={!newEmail.trim()}
              />
            </View>

            {recipients.length > 0 && (
              <View style={$inputContainer}>
                <Text style={$label}>Saved Recipients</Text>
                {recipients.map((email) => (
                  <View key={email} style={$recipientRow}>
                    <Text style={$recipientText}>{email}</Text>
                    <Pressable onPress={() => handleRemoveRecipient(email)}>
                      <Text style={$removeText}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </ScrollView>
      </View>
    </Screen>
  );
}
