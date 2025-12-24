export type EntryType = "text" | "voice" | "photo"

export interface Entry {
  id: number
  dateKey: string
  type: EntryType
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  textContent: string | null
  audioUri: string | null
  photoUri: string | null
  photoTitle: string | null
  durationMs: number | null
  isEdited: number
}

export interface TextRevision {
  id: number
  entryId: number
  textContent: string
  createdAt: string
}

export interface DaySummary {
  dateKey: string
  itemCount: number
  previewText: string | null
  hasVoice: boolean
  hasPhoto: boolean
}

