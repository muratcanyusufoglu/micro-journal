import React from "react"
import { Modal, Pressable, View, ViewStyle } from "react-native"
import { Image as ExpoImage } from "expo-image"
import { IconButton } from "./IconButton"
import { useTheme } from "../theme/ThemeProvider"

interface PhotoViewerModalProps {
  visible: boolean
  photoUri: string
  onClose: () => void
}

export function PhotoViewerModal({ visible, photoUri, onClose }: PhotoViewerModalProps) {
  const theme = useTheme()

  const $overlay: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.scrim,
  }

  const $topBar: ViewStyle = {
    position: "absolute",
    top: theme.spacing.lg,
    right: theme.spacing.md,
    zIndex: 10,
  }

  const $imageContainer: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  }

  const $image: ViewStyle = {
    width: "100%",
    height: "80%",
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.bgSurface,
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={$overlay} onPress={onClose}>
        <View style={$imageContainer} pointerEvents="box-none">
          <View style={$topBar}>
            <IconButton icon="close" onPress={onClose} />
          </View>
          <ExpoImage source={{ uri: photoUri }} style={$image} contentFit="contain" />
        </View>
      </Pressable>
    </Modal>
  )
}







