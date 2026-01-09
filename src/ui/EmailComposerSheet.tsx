import React, {useState, useEffect} from "react";
import {View, TextInput, ViewStyle, TextStyle, Alert} from "react-native";
import {useTheme} from "../theme/ThemeProvider";
import {BottomSheet} from "./BottomSheet";
import {PrimaryButton} from "./PrimaryButton";
import {SecondaryButton} from "./SecondaryButton";
import {useEmailComposer} from "../hooks/useEmailComposer";

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
  const [recipients, setRecipients] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  useEffect(() => {
    if (visible) {
      setRecipients(defaultRecipient);
      setSubject(defaultSubject);
      setBody(defaultBody);
      emailComposer.checkAvailability();
    }
  }, [visible, defaultRecipient, defaultSubject, defaultBody]);

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

  return (
    <BottomSheet visible={visible} title="Send Email" onClose={onClose}>
      <View style={$container}>
        <View style={$inputContainer}>
          <TextInput
            style={[$label, {marginBottom: 0}]}
            value="To"
            editable={false}
          />
          <TextInput
            style={$input}
            value={recipients}
            onChangeText={setRecipients}
            placeholder="email@example.com"
            placeholderTextColor={theme.colors.textPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
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
          <TextInput
            style={[$label, {marginBottom: 0}]}
            value="Body"
            editable={false}
          />
          <TextInput
            style={$textarea}
            value={body}
            onChangeText={setBody}
            placeholder="Email body"
            placeholderTextColor={theme.colors.textPlaceholder}
            multiline
            textAlignVertical="top"
          />
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
