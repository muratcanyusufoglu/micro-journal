import type {Entry, Mood} from "./types";
import {formatDisplayDate, formatDisplayTime} from "./db";

export type EmailTemplate = "single" | "daily" | "weekly";

export interface EmailTemplateData {
  subject: string;
  body: string;
}

const moodLabels: Record<Mood, string> = {
  calm: "Calm",
  happy: "Happy",
  reflective: "Reflective",
  stressed: "Stressed",
  grateful: "Grateful",
  energized: "Energized",
  focused: "Focused",
  sad: "Sad",
};

function formatEntry(entry: Entry): string {
  const lines: string[] = [];
  const time = formatDisplayTime(entry.createdAt);
  const date = formatDisplayDate(entry.dateKey);

  lines.push(`[${date} at ${time}]`);

  if (entry.mood) {
    lines.push(`Mood: ${moodLabels[entry.mood]}`);
  }

  if (entry.type === "text" && entry.textContent) {
    lines.push("");
    lines.push(entry.textContent);
  } else if (entry.type === "voice") {
    const duration = entry.durationMs
      ? `${Math.floor(entry.durationMs / 1000)}s`
      : "Unknown duration";
    lines.push(`Voice note (${duration})`);
  } else if (entry.type === "photo") {
    lines.push("Photo");
    if (entry.textContent) {
      lines.push("");
      lines.push(entry.textContent);
    }
  }

  return lines.join("\n");
}

export function generateSingleEntryEmail(entry: Entry): EmailTemplateData {
  const subject = `OneLine Entry - ${formatDisplayDate(entry.dateKey)}`;
  const body = formatEntry(entry);

  return {subject, body};
}

export function generateDailyEmail(
  entries: Entry[],
  dateKey: string
): EmailTemplateData {
  const date = formatDisplayDate(dateKey);
  const subject = `OneLine Daily Summary - ${date}`;

  const bodyLines: string[] = [];
  bodyLines.push(`Daily Summary for ${date}`);
  bodyLines.push("");
  bodyLines.push(`Total entries: ${entries.length}`);
  bodyLines.push("");

  const moodCounts: Record<Mood, number> = {
    calm: 0,
    happy: 0,
    reflective: 0,
    stressed: 0,
    grateful: 0,
    energized: 0,
    focused: 0,
    sad: 0,
  };

  entries.forEach((entry) => {
    if (entry.mood) {
      moodCounts[entry.mood] += 1;
    }
  });

  const moods = Object.entries(moodCounts)
    .filter(([_, count]) => count > 0)
    .map(([mood, count]) => `${moodLabels[mood as Mood]}: ${count}`)
    .join(", ");

  if (moods) {
    bodyLines.push(`Moods: ${moods}`);
    bodyLines.push("");
  }

  bodyLines.push("---");
  bodyLines.push("");

  entries.forEach((entry) => {
    bodyLines.push(formatEntry(entry));
    bodyLines.push("");
    bodyLines.push("---");
    bodyLines.push("");
  });

  return {subject, body: bodyLines.join("\n")};
}

export function generateWeeklyEmail(
  entries: Entry[],
  startDate: string,
  endDate: string
): EmailTemplateData {
  const subject = `OneLine Weekly Summary - ${formatDisplayDate(
    startDate
  )} to ${formatDisplayDate(endDate)}`;

  const bodyLines: string[] = [];
  bodyLines.push(
    `Weekly Summary from ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`
  );
  bodyLines.push("");
  bodyLines.push(`Total entries: ${entries.length}`);
  bodyLines.push("");

  const entriesByDate = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.dateKey]) {
        acc[entry.dateKey] = [];
      }
      acc[entry.dateKey].push(entry);
      return acc;
    },
    {} as Record<string, Entry[]>
  );

  Object.entries(entriesByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([dateKey, dayEntries]) => {
      bodyLines.push(`## ${formatDisplayDate(dateKey)}`);
      bodyLines.push("");
      dayEntries.forEach((entry) => {
        bodyLines.push(formatEntry(entry));
        bodyLines.push("");
      });
      bodyLines.push("---");
      bodyLines.push("");
    });

  return {subject, body: bodyLines.join("\n")};
}
