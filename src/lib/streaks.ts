import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { habitLogs, habits } from "@/lib/db/schema";

export function todayIso(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function addDays(iso: string, delta: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

type LogStatus = "done" | "skipped" | "frozen";

/**
 * Recomputes current + longest streak from the full log history rather
 * than incrementing counters in place. A day with no log counts as a
 * break unless it's today (not yet acted on) -- "frozen" days keep the
 * streak alive without adding to it, "done" days add to it, "skipped"
 * (or a gap on a past day) breaks it. Recompute-on-write keeps undo
 * trivial: delete the log row, recompute.
 */
export async function recomputeStreak(habitId: string) {
  const logs = await db
    .select({ date: habitLogs.date, status: habitLogs.status })
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId));

  const byDate = new Map<string, LogStatus>(
    logs.map((l) => [l.date, l.status]),
  );

  const today = todayIso();

  // Current streak: walk backward from today.
  let current = 0;
  let cursor = today;
  for (;;) {
    const status = byDate.get(cursor);
    if (status === "done") {
      current += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    if (status === "frozen") {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (!status && cursor === today) {
      // Today not yet logged -- doesn't break the streak.
      cursor = addDays(cursor, -1);
      continue;
    }
    break; // "skipped" or an unlogged past day.
  }

  // Longest streak: scan all logged dates in chronological order and
  // track the best run, treating "frozen" as a pass-through and any
  // date gap between consecutive logged dates as a break.
  const sortedDates = [...byDate.keys()].sort();
  let longest = 0;
  let run = 0;
  let prevDate: string | null = null;
  for (const date of sortedDates) {
    const status = byDate.get(date)!;
    const contiguous = prevDate === null || addDays(prevDate, 1) === date;
    if (!contiguous) run = 0;

    if (status === "done") {
      run += 1;
      longest = Math.max(longest, run);
    } else if (status === "frozen") {
      // keeps the run alive without growing it
    } else {
      run = 0;
    }
    prevDate = date;
  }
  longest = Math.max(longest, current);

  await db
    .update(habits)
    .set({ currentStreak: current, longestStreak: longest })
    .where(eq(habits.id, habitId));

  return { current, longest };
}

/** Frozen logs used this calendar month, for a habit's freeze allowance. */
export async function freezesUsedThisMonth(habitId: string) {
  const monthPrefix = todayIso().slice(0, 7);
  const logs = await db
    .select({ date: habitLogs.date, status: habitLogs.status })
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId));

  return logs.filter(
    (l) => l.status === "frozen" && l.date.startsWith(monthPrefix),
  ).length;
}
