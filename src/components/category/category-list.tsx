"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryIcon } from "@/lib/category-icons";
import { deleteCategory } from "@/app/(app)/settings/categories/actions";
import { CategoryForm } from "./category-form";

type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  isPreset: boolean;
};

export function CategoryList({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"? Todo/habit terkait jadi tanpa kategori.`)) {
      return;
    }
    await deleteCategory(id);
    toast.success(`"${name}" dihapus`);
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${c.color}22`, color: c.color }}
              >
                <CategoryIcon icon={c.icon} className="size-4" />
              </span>
              <span className="truncate text-sm font-medium">{c.name}</span>
              {c.isPreset ? (
                <Badge variant="secondary" className="shrink-0">
                  Preset
                </Badge>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditing(c)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(c.id, c.name)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit kategori</DialogTitle>
          </DialogHeader>
          {editing ? (
            <CategoryForm category={editing} onDone={() => setEditing(null)} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
