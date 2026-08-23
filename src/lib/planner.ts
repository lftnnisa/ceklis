import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { habitLogs, journalEntries, todos } from "@/lib/db/schema";

export type DayActivity = {
  todoCount: number;
  todoDoneCount: number;
  habitDoneCount: number;
  hasJournal: boolean;
};

/** Aggregated per-day activity counts for [startIso, endIso], inclusive. */
export async function getActivityByDate(
  userId: string,
  startIso: string,
  endIso: string,
): Promise<Map<string, DayActivity>> {
  const [rangeTodos, rangeHabitLogs, rangeJournal] = await Promise.all([
    db
      .select({ dueDate: todos.dueDate, status: todos.status })
      .from(todos)
      .where(
        and(
          eq(todos.userId, userId),
          gte(todos.dueDate, startIso),
          lte(todos.dueDate, endIso),
        ),
      ),
    db
      .select({ date: habitLogs.date, status: habitLogs.status })
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.userId, userId),
          gte(habitLogs.date, startIso),
          lte(habitLogs.date, endIso),
        ),
      ),
    db
      .select({ date: journalEntries.date })
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          gte(journalEntries.date, startIso),
          lte(journalEntries.date, endIso),
        ),
      ),
  ]);

  const byDate = new Map<string, DayActivity>();
  function get(date: string) {
    let entry = byDate.get(date);
    if (!entry) {
      entry = { todoCount: 0, todoDoneCount: 0, habitDoneCount: 0, hasJournal: false };
      byDate.set(date, entry);
    }
    return entry;
  }

  for (const t of rangeTodos) {
    if (!t.dueDate) continue;
    const entry = get(t.dueDate);
    entry.todoCount += 1;
    if (t.status === "done") entry.todoDoneCount += 1;
  }
  for (const l of rangeHabitLogs) {
    if (l.status === "done") get(l.date).habitDoneCount += 1;
  }
  for (const j of rangeJournal) {
    get(j.date).hasJournal = true;
  }

  return byDate;
}
