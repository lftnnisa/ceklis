"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHabit } from "@/app/(app)/habits/actions";

type Category = { id: string; name: string };

export function HabitQuickAdd({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const value = name;
    setName("");
    startTransition(async () => {
      await createHabit({
        name: value,
        categoryId: categoryId ?? null,
        frequency: "daily",
        targetPerPeriod: 1,
        freezeAllowancePerMonth: 2,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Habit baru... (mis. Minum air 2L)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Select value={categoryId} onValueChange={setCategoryId}>
        <SelectTrigger className="w-32 shrink-0">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="icon" disabled={isPending || !name.trim()}>
        <Plus className="size-4" />
      </Button>
    </form>
  );
}
