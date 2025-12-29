import React, { useEffect, useRef } from "react"
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  ViewStyle,
  TextStyle,
} from "react-native"
import { useTheme } from "../theme/ThemeProvider"

interface BottomSheetProps {
  visible: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const theme = useTheme()
  const slideAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const $overlay: ViewStyle = {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  }

  const $sheet: ViewStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 200,
  }

  const $handle: ViewStyle = {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderSoft,
    alignSelf: "center",
    marginBottom: theme.spacing.md,
  }

  const $title: TextStyle = {
    fontSize: theme.typography.sectionSerif,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  }

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  })

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={$overlay} onPress={onClose}>
        <Animated.View
          style={[
            $sheet,
            {
              transform: [{ translateY }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={$handle} />
          <Text style={$title}>{title}</Text>
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  )
}







