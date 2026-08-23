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
import { createTodo } from "@/app/(app)/dashboard/actions";

type Category = { id: string; name: string };

export function TodoQuickAdd({ categories }: { categories: Category[] }) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const value = title;
    setTitle("");
    startTransition(async () => {
      await createTodo({ title: value, categoryId: categoryId ?? null });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Tambah tugas..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
      <Button type="submit" size="icon" disabled={isPending || !title.trim()}>
        <Plus className="size-4" />
      </Button>
    </form>
  );
}
