import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(50),
  color: z.string().trim().min(1),
  icon: z.string().trim().min(1),
});

export const todoSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  description: z.string().trim().max(2000).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const habitSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  categoryId: z.string().uuid().optional().nullable(),
  frequency: z.enum(["daily", "weekly"]),
  targetPerPeriod: z.number().int().min(1).max(7),
  freezeAllowancePerMonth: z.number().int().min(0).max(10),
});

export const journalEntrySchema = z.object({
  date: z.string().min(1),
  title: z.string().trim().max(200).optional(),
  content: z.any(),
  mood: z.string().trim().max(20).optional().nullable(),
});
