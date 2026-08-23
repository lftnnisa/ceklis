"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { journalEntries } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { journalEntrySchema } from "@/lib/validations";

export async function upsertJournalEntry(input: {
  date: string;
  title?: string;
  content: unknown;
  mood?: string | null;
}) {
  const userId = await requireUserId();
  const parsed = journalEntrySchema.parse(input);

  const [existing] = await db
    .select({ id: journalEntries.id })
    .from(journalEntries)
    .where(
      and(eq(journalEntries.userId, userId), eq(journalEntries.date, parsed.date)),
    )
    .limit(1);

  if (existing) {
    await db
      .update(journalEntries)
      .set({
        title: parsed.title || null,
        content: parsed.content,
        mood: parsed.mood || null,
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, existing.id));
  } else {
    await db.insert(journalEntries).values({
      userId,
      date: parsed.date,
      title: parsed.title || null,
      content: parsed.content,
      mood: parsed.mood || null,
    });
  }

  revalidatePath("/journal");
  revalidatePath("/planner/day");
}
