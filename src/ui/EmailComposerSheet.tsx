import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { loadEmailSettings } from "../data";
import { useEmailComposer } from "../hooks/useEmailComposer";
import { useTheme } from "../theme/ThemeProvider";
import { BottomSheet } from "./BottomSheet";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

interface EmailComposerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSend: (recipients: string[], subject: string, body: string) => void;
  defaultRecipient?: string;
  defaultSubject?: string;
  defaultBody?: string;
}

export function EmailComposerSheet({
  visible,
  onClose,
  onSend,
  defaultRecipient = "",
  defaultSubject = "",
  defaultBody = "",
}: EmailComposerSheetProps) {
  const theme = useTheme();
  const emailComposer = useEmailComposer();
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [savedRecipients, setSavedRecipients] = useState<string[]>([]);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  // When sheet becomes visible, load recipients and set body/subject
  useEffect(() => {
    if (!visible) {
      setShowRecipientDropdown(false);
      return;
    }

    // Set body and subject immediately
    setBody(defaultBody || "");
    setSubject(defaultSubject || "");

    // Load saved recipients
    async function loadRecipients() {
      try {
        const settings = await loadEmailSettings();
        console.log("📧 EmailComposerSheet: Loaded email settings:", settings);
        const recipientsList = settings.recipients || [];
        console.log("📧 EmailComposerSheet: Recipients list:", recipientsList);
        setSavedRecipients(recipientsList);

        if (defaultRecipient) {
          setRecipients(defaultRecipient);
        } else if (recipientsList.length > 0) {
          setRecipients(recipientsList.join(", "));
        }
      } catch (error) {
        console.error("📧 EmailComposerSheet: Error loading email settings:", error);
        setSavedRecipients([]);
      }
    }

    loadRecipients();
    emailComposer.checkAvailability();
  }, [visible, defaultBody, defaultSubject, defaultRecipient]);

  async function handleSend() {
    if (!recipients.trim()) {
      Alert.alert("Error", "Please enter at least one recipient");
      return;
    }

    if (emailComposer.isAvailable === false) {
      Alert.alert(
        "Email Not Available",
        "Email is not configured on this device"
      );
      return;
    }

    const recipientList = recipients
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    onSend(recipientList, subject.trim(), body.trim());
  }

  const $container: ViewStyle = {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
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

  const $textarea: ViewStyle = {
    ...$input,
    minHeight: 120,
    textAlignVertical: "top",
  };

  const $buttonContainer: ViewStyle = {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  };

  const $savedList: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  };

  const $chip: ViewStyle = {
    borderRadius: 999,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    backgroundColor: theme.colors.bgSurface,
  };

  const $chipSelected: ViewStyle = {
    backgroundColor: theme.colors.accentPrimary,
    borderColor: theme.colors.accentPrimary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.thumb,
    gap: theme.spacing.xs,
  };

  const $chipText: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textPrimary,
  };

  const $chipTextSelected: TextStyle = {
    fontSize: theme.typography.small,
    color: theme.colors.textOnAccent,
    fontWeight: "600",
  };

  const $inputRow: ViewStyle = {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
  };

  const $dropdownButton: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.md,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  };

  const $dropdownContainer: ViewStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    maxHeight: 200,
    zIndex: 1000,
    ...theme.shadows.soft,
  };

  const $dropdownItem: ViewStyle = {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
  };

  const $dropdownItemText: TextStyle = {
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
    paddingRight: theme.spacing.sm,
  };

  const $selectedChipsContainer: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  };

  function toggleRecipient(email: string) {
    const list = recipients
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const exists = list.includes(email);
    const next = exists ? list.filter((r) => r !== email) : [...list, email];
    setRecipients(next.join(", "));
  }

  function addRecipientToInput(email: string) {
    const list = recipients
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (!list.includes(email)) {
      const next = [...list, email];
      setRecipients(next.join(", "));
    }
    setShowRecipientDropdown(false);
  }

  function getSelectedRecipients(): string[] {
    return recipients
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  }

  return (
    <BottomSheet visible={visible} title="Send Email" onClose={onClose}>
      <View style={$container}>
        <View style={$inputContainer}>
          <Text style={$label}>To</Text>
          <View style={$inputRow}>
            <TextInput
              style={[$input, {flex: 1}]}
              value={recipients}
              onChangeText={setRecipients}
              placeholder="email1@example.com, email2@example.com"
              placeholderTextColor={theme.colors.textPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={{position: "relative", zIndex: 1000}}>
              <Pressable
                style={({pressed}) => [
                  $dropdownButton,
                  {
                    backgroundColor: pressed
                      ? theme.colors.bgSubtle
                      : theme.colors.bgSurface,
                    opacity: savedRecipients.length > 0 ? 1 : 0.5,
                  },
                ]}
                onPress={() => {
                  console.log("📧 EmailComposerSheet: Dropdown button pressed, savedRecipients count:", savedRecipients.length);
                  if (savedRecipients.length > 0) {
                    setShowRecipientDropdown(!showRecipientDropdown);
                  } else {
                    console.log("📧 EmailComposerSheet: No saved recipients available");
                  }
                }}
                disabled={savedRecipients.length === 0}
              >
                <MaterialIcons
                  name={showRecipientDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={24}
                  color={theme.colors.textPrimary}
                />
              </Pressable>
              {showRecipientDropdown && savedRecipients.length > 0 && (
                <View style={$dropdownContainer}>
                  <ScrollView>
                    {savedRecipients.map((email) => {
                      const selected = getSelectedRecipients();
                      const isSelected = selected.includes(email);
                      return (
                        <Pressable
                          key={email}
                          style={({pressed}) => [
                            $dropdownItem,
                            {
                              backgroundColor: pressed
                                ? theme.colors.bgSubtle
                                : isSelected
                                ? theme.colors.accentSoft
                                : "transparent",
                            },
                          ]}
                          onPress={() => addRecipientToInput(email)}
                        >
                          <View style={{flex: 1, flexDirection: "row", alignItems: "center", gap: theme.spacing.sm}}>
                            <MaterialIcons
                              name="email"
                              size={20}
                              color={isSelected ? theme.colors.accentPrimary : theme.colors.textSecondary}
                            />
                            <Text 
                              style={[
                                $dropdownItemText,
                                isSelected && {color: theme.colors.accentPrimary, fontWeight: "600"}
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="middle"
                            >
                              {email}
                            </Text>
                          </View>
                          {isSelected && (
                            <MaterialIcons
                              name="check-circle"
                              size={24}
                              color={theme.colors.accentPrimary}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {getSelectedRecipients().length > 0 && (
            <View style={$selectedChipsContainer}>
              {getSelectedRecipients().map((email) => (
                <Pressable
                  key={email}
                  onPress={() => toggleRecipient(email)}
                  style={$chipSelected}
                >
                  <MaterialIcons
                    name="email"
                    size={16}
                    color={theme.colors.textOnAccent}
                  />
                  <Text style={$chipTextSelected} numberOfLines={1}>
                    {email}
                  </Text>
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={theme.colors.textOnAccent}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={$inputContainer}>
          <TextInput
            style={[$label, {marginBottom: 0}]}
            value="Subject"
            editable={false}
          />
          <TextInput
            style={$input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Email subject"
            placeholderTextColor={theme.colors.textPlaceholder}
          />
        </View>

        <View style={$inputContainer}>
          <Text style={$label}>Body</Text>
          <TextInput
            style={$textarea}
            value={body}
            onChangeText={setBody}
            placeholder="Email body"
            placeholderTextColor={theme.colors.textPlaceholder}
            multiline
            textAlignVertical="top"
            editable={true}
          />
          {defaultBody && defaultBody === body && (
            <Text style={[theme.typography.small, {color: theme.colors.textSecondary, marginTop: theme.spacing.xs}]}>
              Entry content is automatically included
            </Text>
          )}
        </View>

        <View style={$buttonContainer}>
          <SecondaryButton title="Cancel" onPress={onClose} style={{flex: 1}} />
          <PrimaryButton
            title="Send"
            onPress={handleSend}
            disabled={emailComposer.isComposing || !recipients.trim()}
            style={{flex: 1}}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
