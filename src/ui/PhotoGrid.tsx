import React from "react"
import { View, Image, Pressable, ViewStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeProvider"

interface PhotoGridProps {
  photos: string[]
  onRemovePhoto: (index: number) => void
  onAddPhoto: () => void
}

export function PhotoGrid({ photos, onRemovePhoto, onAddPhoto }: PhotoGridProps) {
  const theme = useTheme()

  const $grid: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  }

  const $photoContainer: ViewStyle = {
    width: 80,
    height: 80,
    borderRadius: theme.radius.thumb,
    overflow: "hidden",
    position: "relative",
  }

  const $image: ViewStyle = {
    width: "100%",
    height: "100%",
  }

  const $removeButton: ViewStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  }

  const $addButton: ViewStyle = {
    width: 80,
    height: 80,
    borderRadius: theme.radius.thumb,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 2,
    borderColor: `${theme.colors.textSecondary}30`,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  }

  return (
    <View style={$grid}>
      {photos.map((uri, index) => (
        <Pressable
          key={index}
          style={$photoContainer}
          onPress={() => onRemovePhoto(index)}
        >
          <Image source={{ uri }} style={$image} resizeMode="cover" />
          <View style={$removeButton}>
            <MaterialIcons name="close" size={20} color="white" />
          </View>
        </Pressable>
      ))}

      {photos.length < 4 && (
        <Pressable
          style={({ pressed }) => [
            $addButton,
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
          onPress={onAddPhoto}
        >
          <MaterialIcons
            name="add"
            size={32}
            color={`${theme.colors.textSecondary}80`}
          />
        </Pressable>
      )}
    </View>
  )
}


