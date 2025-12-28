import { getDatabase, formatDateKey, formatTimestamp } from "./db"
import type { Entry, TextRevision, DaySummary, Mood, YearMoodCountRow } from "./types"

// ==================== TEXT ENTRIES ====================

export async function addTextEntry(
  dateKey: string,
  text: string,
  mood?: Mood | null
): Promise<number> {
  const db = await getDatabase()
  const now = formatTimestamp(new Date())

  const result = await db.runAsync(
    `INSERT INTO entries (dateKey, type, createdAt, updatedAt, textContent, isEdited, mood)
     VALUES (?, 'text', ?, ?, ?, 0, ?)`,
    [dateKey, now, now, text, mood || null]
  )

  return result.lastInsertRowId
}

export async function updateTextEntry(entryId: number, newText: string): Promise<void> {
  const db = await getDatabase()
  const now = formatTimestamp(new Date())

  // Get current text to save as revision
  const entry = await db.getFirstAsync<Entry>(
    "SELECT * FROM entries WHERE id = ?",
    [entryId]
  )

  if (!entry || entry.type !== "text") {
    throw new Error("Entry not found or not a text entry")
  }

  // Save current text as revision
  await db.runAsync(
    `INSERT INTO text_revisions (entryId, textContent, createdAt)
     VALUES (?, ?, ?)`,
    [entryId, entry.textContent, entry.updatedAt]
  )

  // Update entry with new text
  await db.runAsync(
    `UPDATE entries
     SET textContent = ?, updatedAt = ?, isEdited = 1
     WHERE id = ?`,
    [newText, now, entryId]
  )
}

// ==================== VOICE ENTRIES ====================

export async function addVoiceEntry(
  dateKey: string,
  audioUri: string,
  durationMs: number
): Promise<number> {
  const db = await getDatabase()
  const now = formatTimestamp(new Date())

  const result = await db.runAsync(
    `INSERT INTO entries (dateKey, type, createdAt, updatedAt, audioUri, durationMs, isEdited)
     VALUES (?, 'voice', ?, ?, ?, ?, 0)`,
    [dateKey, now, now, audioUri, durationMs]
  )

  return result.lastInsertRowId
}

// ==================== PHOTO ENTRIES ====================

export async function addPhotoEntry(
  dateKey: string,
  photoUri: string,
  title?: string,
  textContent?: string | null,
  mood?: Mood | null
): Promise<number> {
  const db = await getDatabase()
  const now = formatTimestamp(new Date())

  const result = await db.runAsync(
    `INSERT INTO entries (dateKey, type, createdAt, updatedAt, photoUri, photoTitle, textContent, isEdited, mood)
     VALUES (?, 'photo', ?, ?, ?, ?, ?, 0, ?)`,
    [dateKey, now, now, photoUri, title || null, textContent || null, mood || null]
  )

  return result.lastInsertRowId
}

// ==================== QUERY ENTRIES ====================

export async function listEntriesByDate(dateKey: string): Promise<Entry[]> {
  const db = await getDatabase()

  const entries = await db.getAllAsync<Entry>(
    `SELECT * FROM entries
     WHERE dateKey = ? AND deletedAt IS NULL
     ORDER BY createdAt ASC`,
    [dateKey]
  )

  return entries
}

export async function listAllEntries(limit: number = 30, offset: number = 0): Promise<Entry[]> {
  const db = await getDatabase()

  const entries = await db.getAllAsync<Entry>(
    `SELECT * FROM entries
     WHERE deletedAt IS NULL
     ORDER BY dateKey DESC, createdAt DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  )

  return entries
}

export async function getTotalEntriesCount(): Promise<number> {
  const db = await getDatabase()

  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM entries WHERE deletedAt IS NULL`
  )

  return result?.count || 0
}

export async function getDaySummary(dateKey: string): Promise<DaySummary | null> {
  const db = await getDatabase()

  const countResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM entries
     WHERE dateKey = ? AND deletedAt IS NULL`,
    [dateKey]
  )

  const itemCount = countResult?.count || 0

  if (itemCount === 0) {
    return null
  }

  // Get first text entry for preview
  const previewEntry = await db.getFirstAsync<Entry>(
    `SELECT * FROM entries
     WHERE dateKey = ? AND type = 'text' AND deletedAt IS NULL
     ORDER BY createdAt ASC
     LIMIT 1`,
    [dateKey]
  )

  // Check for voice/photo
  const hasVoiceResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM entries
     WHERE dateKey = ? AND type = 'voice' AND deletedAt IS NULL`,
    [dateKey]
  )

  const hasPhotoResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM entries
     WHERE dateKey = ? AND type = 'photo' AND deletedAt IS NULL`,
    [dateKey]
  )

  return {
    dateKey,
    itemCount,
    previewText: previewEntry?.textContent || null,
    hasVoice: (hasVoiceResult?.count || 0) > 0,
    hasPhoto: (hasPhotoResult?.count || 0) > 0,
  }
}

export async function getEntriesWithContentByMonth(
  year: number,
  month: number
): Promise<string[]> {
  const db = await getDatabase()

  // Get unique dateKeys for the month that have entries
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`

  const results = await db.getAllAsync<{ dateKey: string }>(
    `SELECT DISTINCT dateKey FROM entries
     WHERE dateKey >= ? AND dateKey <= ? AND deletedAt IS NULL
     ORDER BY dateKey ASC`,
    [startDate, endDate]
  )

  return results.map((r) => r.dateKey)
}

// ==================== REVISIONS ====================

export async function listRevisions(entryId: number): Promise<TextRevision[]> {
  const db = await getDatabase()

  const revisions = await db.getAllAsync<TextRevision>(
    `SELECT * FROM text_revisions
     WHERE entryId = ?
     ORDER BY createdAt DESC`,
    [entryId]
  )

  return revisions
}

// ==================== MOOD INSIGHTS ====================

export async function listYearsWithMood(): Promise<string[]> {
  const db = await getDatabase()

  const years = await db.getAllAsync<{ year: string }>(
    `SELECT DISTINCT substr(dateKey, 1, 4) as year
     FROM entries
     WHERE deletedAt IS NULL AND mood IS NOT NULL
     ORDER BY year DESC`
  )

  return years.map((y) => y.year)
}

export async function getYearMoodCounts(year: string): Promise<YearMoodCountRow[]> {
  const db = await getDatabase()

  const rows = await db.getAllAsync<YearMoodCountRow>(
    `SELECT
        substr(dateKey, 1, 4) as year,
        substr(dateKey, 6, 2) as month,
        mood as mood,
        COUNT(*) as count
     FROM entries
     WHERE deletedAt IS NULL
       AND mood IS NOT NULL
       AND substr(dateKey, 1, 4) = ?
     GROUP BY year, month, mood
     ORDER BY month ASC`,
    [year]
  )

  return rows
}

// ==================== DELETE ====================

export async function deleteEntry(entryId: number): Promise<void> {
  const db = await getDatabase()
  const now = formatTimestamp(new Date())

  // Soft delete
  await db.runAsync(
    `UPDATE entries SET deletedAt = ? WHERE id = ?`,
    [now, entryId]
  )
}

// ==================== UTILITY ====================

export async function getTodayDateKey(): Promise<string> {
  return formatDateKey(new Date())
}
