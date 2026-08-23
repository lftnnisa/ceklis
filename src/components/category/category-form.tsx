"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CATEGORY_COLORS,
  CATEGORY_ICON_NAMES,
  CategoryIcon,
} from "@/lib/category-icons";
import { createCategory, updateCategory } from "@/app/(app)/settings/categories/actions";

type CategoryFormProps = {
  category?: { id: string; name: string; color: string; icon: string };
  onDone?: () => void;
};

export function CategoryForm({ category, onDone }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICON_NAMES[0]);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      if (category) {
        await updateCategory(category.id, { name, color, icon });
      } else {
        await createCategory({ name, color, icon });
        setName("");
      }
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border p-3">
      <Input
        placeholder="Nama kategori"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className="flex size-7 items-center justify-center rounded-full"
            style={{ backgroundColor: c }}
          >
            {color === c ? <Check className="size-4 text-white" /> : null}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_ICON_NAMES.map((name_) => (
          <button
            key={name_}
            type="button"
            onClick={() => setIcon(name_)}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg border transition-colors",
              icon === name_ ? "border-primary bg-primary/10" : "hover:bg-muted",
            )}
          >
            <CategoryIcon icon={name_} className="size-4" />
          </button>
        ))}
      </div>

      <Button type="submit" size="sm" disabled={isPending || !name.trim()}>
        {category ? "Simpan" : "Tambah kategori"}
      </Button>
    </form>
  );
}
