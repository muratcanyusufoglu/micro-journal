import * as SQLite from "expo-sqlite"

let db: SQLite.SQLiteDatabase | null = null

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db

  db = await SQLite.openDatabaseAsync("oneline.db")

  // Run migrations
  await runMigrations(db)

  return db
}

async function runMigrations(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dateKey TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('text', 'voice', 'photo')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deletedAt TEXT,
      textContent TEXT,
      audioUri TEXT,
      photoUri TEXT,
      photoTitle TEXT,
      durationMs INTEGER,
      isEdited INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_entries_dateKey ON entries(dateKey);
    CREATE INDEX IF NOT EXISTS idx_entries_createdAt ON entries(createdAt);
    CREATE INDEX IF NOT EXISTS idx_entries_deletedAt ON entries(deletedAt);

    CREATE TABLE IF NOT EXISTS text_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entryId INTEGER NOT NULL,
      textContent TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(entryId) REFERENCES entries(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_text_revisions_entryId ON text_revisions(entryId);
  `)
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.")
  }
  return db
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatTimestamp(date: Date): string {
  return date.toISOString()
}

export function formatDisplayTime(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes} ${ampm}`
}

export function formatDisplayDate(dateKey: string): string {
  const date = new Date(dateKey)
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayName = days[date.getDay()]
  const monthName = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()

  return `${dayName}, ${monthName} ${day}, ${year}`
}

