import { useState, useRef, useEffect } from "react"
import { Audio } from "expo-av"

export function useVoicePlayer(uri: string) {
  const [isPlaying, setIsPlaying] = useState(false)
  const soundRef = useRef<Audio.Sound | null>(null)

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync()
      }
    }
  }, [])

  async function togglePlayPause() {
    try {
      if (!soundRef.current) {
        // Load and play
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        )

        soundRef.current = sound

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying)

            if (status.didJustFinish) {
              setIsPlaying(false)
              soundRef.current?.unloadAsync()
              soundRef.current = null
            }
          }
        })

        setIsPlaying(true)
      } else {
        // Toggle play/pause
        const status = await soundRef.current.getStatusAsync()
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync()
            setIsPlaying(false)
          } else {
            await soundRef.current.playAsync()
            setIsPlaying(true)
          }
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  return {
    isPlaying,
    togglePlayPause,
  }
}

