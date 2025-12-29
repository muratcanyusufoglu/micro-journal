import React from "react";
import {MaterialIcons} from "@expo/vector-icons";
import {Pressable, Text, TextStyle, View, ViewStyle} from "react-native";
import {useTheme} from "../theme/ThemeProvider";
import {BottomSheet} from "./BottomSheet";

type ActionSheetVariant = "default" | "destructive";

export interface ActionSheetAction {
  label: string;
  icon?: string;
  variant?: ActionSheetVariant;
  disabled?: boolean;
  closeOnPress?: boolean;
  onPress: () => void | Promise<void>;
}

interface ActionSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  actions: ActionSheetAction[];
  cancelLabel?: string;
}

export function ActionSheet({
  visible,
  title,
  onClose,
  actions,
  cancelLabel = "Cancel",
}: ActionSheetProps) {
  const theme = useTheme();

  const $group: ViewStyle = {
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderCard,
    overflow: "hidden",
    backgroundColor: theme.colors.bgSurface,
  };

  const $rowBase: ViewStyle = {
    height: 54,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const $rowLeft: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  };

  const $labelBase: TextStyle = {
    fontSize: theme.typography.body,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  };

  const $separator: ViewStyle = {
    height: 1,
    backgroundColor: theme.colors.borderSoft,
  };

  const $cancelWrap: ViewStyle = {
    marginTop: theme.spacing.md,
  };

  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <View style={$group}>
        {actions.map((action, index) => {
          const isLast = index === actions.length - 1;
          const isDestructive = action.variant === "destructive";
          const isDisabled = !!action.disabled;

          return (
            <View key={`${action.label}-${index}`}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={action.label}
                disabled={isDisabled}
                onPress={async () => {
                  const shouldClose = action.closeOnPress ?? true;
                  if (shouldClose) onClose();
                  await action.onPress();
                }}
                style={({pressed}) => [
                  $rowBase,
                  {
                    opacity: isDisabled ? 0.4 : pressed ? 0.7 : 1,
                    backgroundColor: pressed
                      ? isDestructive
                        ? theme.colors.dangerSoft
                        : theme.colors.bgSubtle
                      : theme.colors.bgSurface,
                  },
                ]}
              >
                <View style={$rowLeft}>
                  {!!action.icon && (
                    <MaterialIcons
                      name={action.icon as any}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  )}
                  <Text style={$labelBase}>{action.label}</Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={theme.colors.textMuted}
                />
              </Pressable>
              {!isLast && <View style={$separator} />}
            </View>
          );
        })}
      </View>

      <View style={$cancelWrap}>
        <View style={$group}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            onPress={onClose}
            style={({pressed}) => [
              $rowBase,
              {
                opacity: pressed ? 0.7 : 1,
                justifyContent: "center",
              },
            ]}
          >
            <Text style={$labelBase}>{cancelLabel}</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}




