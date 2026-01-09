import React, {useState, useEffect} from "react";
import {Alert, ScrollView, Text, TextInput, View, ViewStyle, TextStyle} from "react-native";
import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useTheme} from "../src/theme/ThemeProvider";
import {AppHeader, Card, Screen, PrimaryButton} from "../src/ui";
import type {EmailTemplate} from "../src/data/emailTemplates";

const EMAIL_SETTINGS_KEY = "@oneline:email_settings";

interface EmailSettings {
  defaultRecipient: string;
  defaultTemplate: EmailTemplate;
  enabled: boolean;
}

export default function EmailSettingsScreen() {
  const theme = useTheme();
  const [settings, setSettings] = useState<EmailSettings>({
    defaultRecipient: "",
    defaultTemplate: "single",
    enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(EMAIL_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading email settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings() {
    try {
      await AsyncStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(settings));
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
              <Text style={$label}>Default Recipient</Text>
              <TextInput
                style={$input}
                value={settings.defaultRecipient}
                onChangeText={(text) =>
                  setSettings({...settings, defaultRecipient: text})
                }
                placeholder="email@example.com"
                placeholderTextColor={theme.colors.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={$inputContainer}>
              <Text style={$label}>Default Template</Text>
              <View style={{gap: theme.spacing.xs}}>
                {(["single", "daily", "weekly"] as EmailTemplate[]).map(
                  (template) => (
                    <PrimaryButton
                      key={template}
                      title={template.charAt(0).toUpperCase() + template.slice(1)}
                      onPress={() =>
                        setSettings({...settings, defaultTemplate: template})
                      }
                      disabled={settings.defaultTemplate === template}
                      style={{
                        opacity: settings.defaultTemplate === template ? 0.5 : 1,
                      }}
                    />
                  )
                )}
              </View>
            </View>
          </Card>

          <View style={$buttonContainer}>
            <PrimaryButton title="Save Settings" onPress={saveSettings} />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
