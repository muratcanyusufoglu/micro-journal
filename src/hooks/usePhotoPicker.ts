import { useState } from "react"
import * as ImagePicker from "expo-image-picker"

export function usePhotoPicker() {
  const [photos, setPhotos] = useState<string[]>([])

  async function pickPhoto() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        throw new Error("Permission to access media library denied")
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      })

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri
        setPhotos((prev) => [...prev, uri])
        return uri
      }

      return null
    } catch (error) {
      console.error("Error picking photo:", error)
      return null
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function resetPhotos() {
    setPhotos([])
  }

  return {
    photos,
    pickPhoto,
    removePhoto,
    resetPhotos,
  }
}

