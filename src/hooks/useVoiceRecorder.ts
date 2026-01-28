import { useState, useRef } from "react"
import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system/legacy"

// Lazy load Voice module to handle cases where native module is not available
let Voice: any = null;
try {
  Voice = require("@react-native-voice/voice").default;
} catch (error) {
  console.warn("Voice module not available:", error);
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordedUri, setRecordedUri] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<string>("")
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
      setTranscription("")

      // Start speech recognition (if available)
      if (Voice) {
        try {
          await Voice.start("en-US")
          Voice.onSpeechResults = (e: any) => {
            if (e.value && e.value.length > 0) {
              setTranscription(e.value[0])
            }
          }
          Voice.onSpeechPartialResults = (e: any) => {
            if (e.value && e.value.length > 0) {
              setTranscription(e.value[0])
            }
          }
        } catch (speechError) {
          console.warn("Speech recognition not available:", speechError)
          // Continue recording even if speech recognition fails
        }
      }

      // Update duration every second
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  async function stopRecording(): Promise<{uri: string | null; transcription: string}> {
    if (!recordingRef.current) return {uri: null, transcription: ""}

    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setIsRecording(false)
      
      // Stop speech recognition (if available)
      if (Voice) {
        try {
          await Voice.stop()
        } catch (speechError) {
          console.warn("Failed to stop speech recognition:", speechError)
        }
      }

      await recordingRef.current.stopAndUnloadAsync()

      const uri = recordingRef.current.getURI()
      const finalTranscription = transcription
      recordingRef.current = null

      if (!uri) return {uri: null, transcription: finalTranscription}

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
      return {uri: newUri, transcription: finalTranscription}
    } catch (error) {
      console.error("Failed to stop recording:", error)
      return {uri: null, transcription: transcription}
    }
  }

  function resetRecording() {
    setRecordingDuration(0)
    setRecordedUri(null)
    setTranscription("")
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
    transcription,
    formattedDuration: formatDuration(recordingDuration),
    startRecording,
    stopRecording,
    resetRecording,
  }
}

