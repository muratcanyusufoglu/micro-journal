import { useState, useRef } from "react"
import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system/legacy"

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordedUri, setRecordedUri] = useState<string | null>(null)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync()
      if (!permission.granted) {
        throw new Error("Permission to access microphone denied")
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )

      recordingRef.current = recording
      setIsRecording(true)
      setRecordingDuration(0)

      // Update duration every second
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  async function stopRecording(): Promise<string | null> {
    if (!recordingRef.current) return null

    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setIsRecording(false)
      await recordingRef.current.stopAndUnloadAsync()

      const uri = recordingRef.current.getURI()
      recordingRef.current = null

      if (!uri) return null

      // Move to permanent location
      const voiceDir = `${FileSystem.documentDirectory}voice/`
      
      // Create directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(voiceDir)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(voiceDir, { intermediates: true })
      }

      const filename = `voice_${Date.now()}.m4a`
      const newUri = `${voiceDir}${filename}`
      await FileSystem.moveAsync({ from: uri, to: newUri })

      setRecordedUri(newUri)
      return newUri
    } catch (error) {
      console.error("Failed to stop recording:", error)
      return null
    }
  }

  function resetRecording() {
    setRecordingDuration(0)
    setRecordedUri(null)
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return {
    isRecording,
    recordingDuration: recordingDuration * 1000, // Convert to ms
    recordedUri,
    formattedDuration: formatDuration(recordingDuration),
    startRecording,
    stopRecording,
    resetRecording,
  }
}

