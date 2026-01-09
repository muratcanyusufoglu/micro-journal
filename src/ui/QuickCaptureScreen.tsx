import React, {useRef, useEffect} from "react";
import {
  View,
  TextInput,
  Keyboard,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import {useTheme} from "../theme/ThemeProvider";
import {PrimaryButton} from "./PrimaryButton";

interface QuickCaptureScreenProps {
  initialText?: string;
  onSave: (text: string) => void;
  onCancel?: () => void;
}

export function QuickCaptureScreen({
  initialText = "",
  onSave,
  onCancel,
}: QuickCaptureScreenProps) {
  const theme = useTheme();
  const [text, setText] = React.useState(initialText);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  function handleSave() {
    if (!text.trim()) return;

    Keyboard.dismiss();
    onSave(text.trim());
  }

  function handleKeyPress(e: any) {
    if (Platform.OS === "ios" && e.nativeEvent.key === "Enter") {
      if (!e.nativeEvent.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    }
  }

  const $container: ViewStyle = {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "space-between",
  };

  const $inputContainer: ViewStyle = {
    flex: 1,
    marginBottom: theme.spacing.lg,
  };

  const $input: TextStyle = {
    fontSize: 24,
    lineHeight: 36,
    color: theme.colors.textPrimary,
    fontWeight: "400",
    flex: 1,
    textAlignVertical: "top",
  };

  const $buttonContainer: ViewStyle = {
    paddingTop: theme.spacing.md,
  };

  return (
    <View style={$container}>
      <View style={$inputContainer}>
        <TextInput
          ref={inputRef}
          style={$input}
          value={text}
          onChangeText={setText}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.colors.textPlaceholder}
          multiline
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
          onKeyPress={handleKeyPress}
        />
      </View>

      <View style={$buttonContainer}>
        <PrimaryButton
          title="Save"
          onPress={handleSave}
          disabled={!text.trim()}
        />
      </View>
    </View>
  );
}
