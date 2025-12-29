import JSZip from "jszip";
// Use legacy API to get stable Base64 read/write helpers
import * as FileSystem from "expo-file-system/legacy";
import {
  listEntriesByDateRange,
  listRevisionsByDateRange,
} from "./repository";
import type {Entry, TextRevision} from "./types";

export type ExportFormat = "zip" | "notion" | "obsidian";

export interface ExportOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  includeMedia?: boolean;
  format?: ExportFormat;
}

export interface ExportResult {
  path: string;
  entryCount: number;
  mediaCount: number;
  format: ExportFormat;
}

function toSafeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, "_");
}

async function addFileToZip(
  zip: JSZip,
  folder: string,
  uri: string
): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || info.isDirectory) return false;

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: (FileSystem as any).EncodingType?.Base64 ?? "base64",
    });

    const filenamePart = uri.split("/").pop() || `file_${Date.now()}`;
    const filename = `${folder}/${toSafeFilename(filenamePart)}`;
    zip.file(filename, base64, {base64: true});
    return true;
  } catch (error) {
    console.warn("Skipping media in export:", error);
    return false;
  }
}

function entryToCsvRow(entry: Entry): string {
  const q = (v: any) =>
    `"${String(v ?? "")
      .replace(/"/g, '""')
      .replace(/\n/g, "\\n")}"`;
  return [
    q(entry.id),
    q(entry.dateKey),
    q(entry.type),
    q(entry.mood ?? ""),
    q(entry.textContent ?? ""),
    q(entry.photoUri ?? ""),
    q(entry.audioUri ?? ""),
    q(entry.createdAt),
    q(entry.updatedAt),
  ].join(",");
}

function entryToObsidianMd(entry: Entry): string {
  const frontmatter = [
    "---",
    `id: ${entry.id}`,
    `date: ${entry.dateKey}`,
    `type: ${entry.type}`,
    `mood: ${entry.mood ?? ""}`,
    `createdAt: ${entry.createdAt}`,
    `updatedAt: ${entry.updatedAt}`,
    `photoUri: ${entry.photoUri ?? ""}`,
    `audioUri: ${entry.audioUri ?? ""}`,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n${entry.textContent ?? ""}`;
}

async function exportZipRaw(
  zip: JSZip,
  entries: Entry[],
  revisions: TextRevision[],
  includeMedia: boolean
) {
  let mediaCount = 0;

  zip.file(
    "data.json",
    JSON.stringify(
      {
        manifest: {
          createdAt: new Date().toISOString(),
          version: 1,
        },
        entries,
        revisions,
      },
      null,
      2
    )
  );

  if (includeMedia) {
    const mediaFolder = zip.folder("media");
    if (mediaFolder) {
      for (const entry of entries) {
        if (entry.photoUri) {
          const ok = await addFileToZip(mediaFolder, "photos", entry.photoUri);
          if (ok) mediaCount += 1;
        }
        if (entry.audioUri) {
          const ok = await addFileToZip(mediaFolder, "audio", entry.audioUri);
          if (ok) mediaCount += 1;
        }
      }
    }
  }

  return mediaCount;
}

async function exportNotion(
  zip: JSZip,
  entries: Entry[],
  includeMedia: boolean
) {
  const header =
    "id,dateKey,type,mood,textContent,photoUri,audioUri,createdAt,updatedAt";
  const csv = [header, ...entries.map(entryToCsvRow)].join("\n");
  zip.file("notion.csv", csv);

  let mediaCount = 0;
  if (includeMedia) {
    const mediaFolder = zip.folder("media");
    if (mediaFolder) {
      for (const entry of entries) {
        if (entry.photoUri) {
          const ok = await addFileToZip(mediaFolder, "photos", entry.photoUri);
          if (ok) mediaCount += 1;
        }
        if (entry.audioUri) {
          const ok = await addFileToZip(mediaFolder, "audio", entry.audioUri);
          if (ok) mediaCount += 1;
        }
      }
    }
  }
  return mediaCount;
}

async function exportObsidian(
  zip: JSZip,
  entries: Entry[],
  includeMedia: boolean
) {
  let mediaCount = 0;
  const notesFolder = zip.folder("notes") ?? zip;

  for (const entry of entries) {
    const name = `${entry.dateKey}_${entry.id}.md`;
    notesFolder.file(name, entryToObsidianMd(entry));
  }

  if (includeMedia) {
    const mediaFolder = zip.folder("media");
    if (mediaFolder) {
      for (const entry of entries) {
        if (entry.photoUri) {
          const ok = await addFileToZip(mediaFolder, "photos", entry.photoUri);
          if (ok) mediaCount += 1;
        }
        if (entry.audioUri) {
          const ok = await addFileToZip(mediaFolder, "audio", entry.audioUri);
          if (ok) mediaCount += 1;
        }
      }
    }
  }

  return mediaCount;
}

export async function exportEntries(
  options: ExportOptions
): Promise<ExportResult> {
  const {startDate, endDate, includeMedia = true, format = "zip"} = options;
  const entries = await listEntriesByDateRange(startDate, endDate);
  const revisions = await listRevisionsByDateRange(startDate, endDate);

  const zip = new JSZip();
  let mediaCount = 0;

  if (format === "zip") {
    mediaCount = await exportZipRaw(zip, entries, revisions, includeMedia);
  } else if (format === "notion") {
    mediaCount = await exportNotion(zip, entries, includeMedia);
  } else if (format === "obsidian") {
    mediaCount = await exportObsidian(zip, entries, includeMedia);
  }

  const base64 = await zip.generateAsync({
    type: "base64",
    compression: "DEFLATE",
    compressionOptions: {level: 6},
  });

  const filename = `${format}_${startDate}_${endDate}_${Date.now()}.zip`;
  const dest = `${FileSystem.documentDirectory}${toSafeFilename(filename)}`;

  await FileSystem.writeAsStringAsync(dest, base64, {
    encoding: (FileSystem as any).EncodingType?.Base64 ?? "base64",
  });

  return {
    path: dest,
    entryCount: entries.length,
    mediaCount,
    format,
  };
}

