import React, {useEffect, useMemo, useState} from "react";
import {Keyboard, TextInput, TextStyle, View, ViewStyle} from "react-native";
import {useTheme} from "../theme/ThemeProvider";
import {BottomSheet} from "./BottomSheet";
import {PrimaryButton} from "./PrimaryButton";
import {SecondaryButton} from "./SecondaryButton";

interface TextEditorSheetProps {
  visible: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  onClose: () => void;
  onSave: (value: string) => void | Promise<void>;
}

export function TextEditorSheet({
  visible,
  title,
  initialValue,
  placeholder = "Edit your entry…",
  onClose,
  onSave,
}: TextEditorSheetProps) {
  const theme = useTheme();
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setValue(initialValue);
  }, [visible, initialValue]);

  const trimmed = value.trim();
  const isDirty = trimmed !== initialValue.trim();
  const canSave = isDirty && trimmed.length > 0 && !isSaving;

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
              await onSave(trimmed);
              onClose();
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={!canSave}
          style={$saveStyle}
        />
      </View>
    </BottomSheet>
  );
}


