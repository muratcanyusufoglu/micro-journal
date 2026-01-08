import React, {useEffect, useMemo, useState} from "react";
import {Keyboard, ScrollView, View, ViewStyle} from "react-native";
import type {Mood} from "../data/types";
import {useTheme} from "../theme/ThemeProvider";
import {BottomSheet} from "./BottomSheet";
import {MoodRibbonPicker} from "./MoodRibbonPicker";
import {PrimaryButton} from "./PrimaryButton";
import {SecondaryButton} from "./SecondaryButton";
import {TextAreaCard} from "./TextAreaCard";

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

  useEffect(() => {
    if (!visible) return;
    setValue(initialValue);
    setMood(initialMood);
  }, [visible, initialValue, initialMood]);

  const trimmed = value.trim();
  const isDirty = trimmed !== initialValue.trim() || mood !== initialMood;
  const canSave = trimmed.length > 0 && isDirty && !isSaving;

  const $inputWrap: ViewStyle = {
    marginBottom: theme.spacing.md,
  };

  const $buttons: ViewStyle = {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
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
      keyboardOffset={0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingBottom: theme.spacing.md}}
      >
        <View style={$inputWrap}>
          <TextAreaCard
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            footerRight={<MoodRibbonPicker value={mood} onChange={setMood} />}
            minHeight={220}
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
    </BottomSheet>
  );
}
