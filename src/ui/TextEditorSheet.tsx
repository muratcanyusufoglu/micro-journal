import React, {useEffect, useMemo, useState} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import {useTheme} from "../theme/ThemeProvider";
import {BottomSheet} from "./BottomSheet";
import {PrimaryButton} from "./PrimaryButton";
import {SecondaryButton} from "./SecondaryButton";
import {MoodRibbonPicker} from "./MoodRibbonPicker";
import type {Mood} from "../data/types";

interface TextEditorSheetProps {
  visible: boolean;
  title: string;
  initialValue: string;
  initialMood?: Mood | null;
  placeholder?: string;
  onClose: () => void;
  onSave: (value: string, mood: Mood | null) => void | Promise<void>;
}

export function TextEditorSheet({
  visible,
  title,
  initialValue,
  initialMood = null,
  placeholder = "Edit your entry…",
  onClose,
  onSave,
}: TextEditorSheetProps) {
  const theme = useTheme();
  const [value, setValue] = useState(initialValue);
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [isSaving, setIsSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const bottomPad = keyboardHeight > 0 ? keyboardHeight + theme.spacing.xl : theme.spacing.xl;

  useEffect(() => {
    if (!visible) return;
    setValue(initialValue);
    setMood(initialMood);
  }, [visible, initialValue, initialMood]);

  useEffect(() => {
    function onShow(e: any) {
      setKeyboardHeight(e?.endCoordinates?.height ?? 0);
    }
    function onHide() {
      setKeyboardHeight(0);
    }
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      onShow
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      onHide
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const trimmed = value.trim();
  const isDirty = trimmed !== initialValue.trim() || mood !== initialMood;
  const canSave = trimmed.length > 0 && isDirty && !isSaving;

  const $inputWrap: ViewStyle = {
    backgroundColor: theme.colors.bgSubtle,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    padding: theme.spacing.lg,
    minHeight: 220,
  };

  const $input: TextStyle = {
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.textPrimary,
    flex: 1,
  };

  const $buttons: ViewStyle = {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
  };

  const $cancelStyle = useMemo<ViewStyle>(() => ({flex: 1}), []);
  const $saveStyle = useMemo<ViewStyle>(() => ({flex: 1}), []);

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={() => {
        if (isSaving) return;
        onClose();
      }}
      bottomInsetBehavior="keyboard"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{paddingBottom: bottomPad, flexGrow: 1, justifyContent: "flex-start"}}
        >
          <View style={$inputWrap}>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.textPlaceholder}
              autoFocus
              multiline
              textAlignVertical="top"
              style={$input}
            />
          </View>

          <View style={{marginTop: theme.spacing.md}}>
            <Text
              style={{
                fontSize: theme.typography.small,
                fontWeight: "600",
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xs,
              }}
            >
              Mood (optional)
            </Text>
            <MoodRibbonPicker value={mood} onChange={setMood} />
          </View>

          <View style={$buttons}>
            <SecondaryButton
              title="Cancel"
              onPress={() => {
                if (isSaving) return;
                Keyboard.dismiss();
                onClose();
              }}
              style={$cancelStyle}
            />
            <PrimaryButton
              title={isSaving ? "Saving…" : "Save"}
              onPress={async () => {
                if (!canSave) return;
                setIsSaving(true);
                try {
                  Keyboard.dismiss();
                  await onSave(trimmed, mood);
                  onClose();
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={!canSave}
              style={$saveStyle}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}







