import React, {useState, useEffect} from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import {router} from "expo-router";
import {useTheme} from "../src/theme/ThemeProvider";
import {AppHeader, Card, Screen, PrimaryButton} from "../src/ui";
import {loadEmailSettings, saveEmailSettings} from "../src/data";

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
      setRecipients(settings.recipients);
    } catch (error) {
      console.error("Error loading email settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings() {
    try {
      await saveEmailSettings({recipients});
      Alert.alert("Saved", "Email settings saved successfully");
    } catch (error) {
      console.error("Error saving email settings:", error);
      Alert.alert("Error", "Failed to save settings");
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

  function handleAddRecipient() {
    const email = newEmail.trim();
    if (!email) return;

    if (!email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address");
      return;
    }

    if (recipients.includes(email)) {
      Alert.alert("Already added", "This email is already in your list");
      return;
    }

    setRecipients([...recipients, email]);
    setNewEmail("");
  }

  function handleRemoveRecipient(email: string) {
    setRecipients(recipients.filter((r) => r !== email));
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

          <View style={$buttonContainer}>
            <PrimaryButton title="Save Settings" onPress={saveSettings} />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
