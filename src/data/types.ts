export type EntryType = "text" | "voice" | "photo";

export type Mood =
  | "calm"
  | "happy"
  | "reflective"
  | "stressed"
  | "grateful"
  | "energized"
  | "focused"
  | "sad";

export interface Entry {
  id: number;
  dateKey: string;
  type: EntryType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  textContent: string | null;
  audioUri: string | null;
  photoUri: string | null;
  photoTitle: string | null;
  durationMs: number | null;
  isEdited: number;
  mood: Mood | null;
}

export interface TextRevision {
  id: number;
  entryId: number;
  textContent: string;
  createdAt: string;
}

export interface DaySummary {
  dateKey: string;
  itemCount: number;
  previewText: string | null;
  hasVoice: boolean;
  hasPhoto: boolean;
}

export interface YearMoodCountRow {
  year: string;
  month: string; // "01".."12"
  mood: Mood;
  count: number;
}

export interface ShareData {
  text?: string;
  url?: string;
  imageUri?: string;
  imageUris?: string[]; // Multiple images
  type: "text" | "url" | "image" | "file";
}
