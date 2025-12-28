import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useTheme} from "../theme/ThemeProvider";

type ToastVariant = "success" | "error";

interface ToastOptions {
  title: string;
  message?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastState extends Required<Pick<ToastOptions, "title" | "variant">> {
  message?: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({children}: ToastProviderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [toast, setToast] = useState<ToastState | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  function clearTimer() {
    if (!hideTimerRef.current) return;
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }

  function hideToast() {
    clearTimer();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 12,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) setToast(null);
    });
  }

  function showToast(options: ToastOptions) {
    clearTimer();
    setToast({
      title: options.title,
      message: options.message,
      variant: options.variant ?? "success",
    });

    opacity.setValue(0);
    translateY.setValue(12);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    hideTimerRef.current = setTimeout(() => {
      hideToast();
    }, options.durationMs ?? 2200);
  }

  const value = useMemo(() => ({showToast, hideToast}), []);

  const isVisible = !!toast;

  const $toastWrap: StyleProp<ViewStyle> = [
    $toastWrapBase,
    {
      paddingTop: Math.max(insets.top, theme.spacing.md),
      paddingHorizontal: theme.spacing.md,
    },
  ];

  const $toastCard: StyleProp<ViewStyle> = [
    $toastCardBase,
    theme.shadows.medium,
    {
      backgroundColor: theme.colors.bgSurface,
      borderColor: theme.colors.borderCard,
      borderRadius: theme.radius.thumb,
    },
  ];

  const $badge: StyleProp<ViewStyle> = [
    $badgeBase,
    {
      backgroundColor:
        toast?.variant === "error"
          ? theme.colors.dangerSoft
          : theme.colors.successSoft,
      borderRadius: theme.radius.iconButton,
    },
  ];

  const $title: StyleProp<TextStyle> = [
    $titleBase,
    {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.small,
    },
  ];

  const $message: StyleProp<TextStyle> = [
    $messageBase,
    {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.micro,
    },
  ];

  return (
    <ToastContext.Provider value={value}>
      {children}
      {isVisible && (
        <View pointerEvents="box-none" style={$toastWrap}>
          <Animated.View
            style={[
              $toastCard,
              {
                opacity,
                transform: [{translateY}],
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              onPress={hideToast}
              style={$toastPressable}
            >
              <View style={$badge} />
              <View style={$textArea}>
                <Text numberOfLines={1} style={$title}>
                  {toast?.title}
                </Text>
                {!!toast?.message && (
                  <Text numberOfLines={2} style={$message}>
                    {toast.message}
                  </Text>
                )}
              </View>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

const $toastWrapBase: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  alignItems: "center",
};

const $toastCardBase: ViewStyle = {
  maxWidth: 520,
  width: "100%",
  borderWidth: 1,
};

const $toastPressable: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 12,
  gap: 10,
};

const $badgeBase: ViewStyle = {
  width: 10,
  height: 10,
};

const $textArea: ViewStyle = {
  flex: 1,
};

const $titleBase: TextStyle = {
  fontWeight: "600",
};

const $messageBase: TextStyle = {
  marginTop: 2,
};
