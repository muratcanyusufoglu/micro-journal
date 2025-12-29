import JSZip from "jszip";
// Use legacy API to get stable Base64 read/write helpers
import * as FileSystem from "expo-file-system/legacy";
import {
  listEntriesByDateRange,
  listRevisionsByDateRange,
} from "./repository";
import type {Entry, TextRevision} from "./types";

export interface ExportOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  includeMedia?: boolean;
}

export interface ExportResult {
  path: string;
  entryCount: number;
  mediaCount: number;
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

export async function exportEntriesToZip(
  options: ExportOptions
): Promise<ExportResult> {
  const {startDate, endDate, includeMedia = true} = options;
  const entries = await listEntriesByDateRange(startDate, endDate);
  const revisions = await listRevisionsByDateRange(startDate, endDate);

  const zip = new JSZip();
  const manifest = {
    meta: {
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      version: 1,
    },
    counts: {
      entries: entries.length,
      revisions: revisions.length,
    },
  };

  zip.file(
    "data.json",
    JSON.stringify(
      {
        manifest,
        entries,
        revisions,
      },
      null,
      2
    )
  );

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

  const base64 = await zip.generateAsync({
    type: "base64",
    compression: "DEFLATE",
    compressionOptions: {level: 6},
  });

  const filename = `backup_${startDate}_${endDate}_${Date.now()}.zip`;
  const dest = `${FileSystem.documentDirectory}${toSafeFilename(filename)}`;

  await FileSystem.writeAsStringAsync(dest, base64, {
    encoding: (FileSystem as any).EncodingType?.Base64 ?? "base64",
  });

  return {
    path: dest,
    entryCount: entries.length,
    mediaCount,
  };
}

