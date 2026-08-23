"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { Bold, Heading2, Italic, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { upsertJournalEntry } from "@/app/(app)/journal/actions";

const MOODS = ["😄", "🙂", "😐", "😔", "😣"];

type JournalEditorProps = {
  date: string;
  initialTitle?: string;
  initialContent?: JSONContent | null;
  initialMood?: string | null;
};

export function JournalEditor({
  date,
  initialTitle,
  initialContent,
  initialMood,
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [mood, setMood] = useState<string | null>(initialMood ?? null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "journal-content min-h-40 focus:outline-none px-3 py-2",
      },
    },
    onUpdate: () => scheduleSave(),
  });

  function scheduleSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 800);
  }

  async function save() {
    if (!editor) return;
    await upsertJournalEntry({
      date,
      title,
      content: editor.getJSON(),
      mood,
    });
  }

  async function handleBlurSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await save();
    toast.success("Tersimpan", { duration: 1200 });
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlurSave}
          placeholder="Judul (opsional)"
          className="border-0 px-0 text-base font-semibold shadow-none focus-visible:ring-0"
        />
        <div className="flex shrink-0 gap-1">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMood(mood === m ? null : m);
                scheduleSave();
              }}
              className={cn(
                "rounded-md p-1 text-lg leading-none transition-transform hover:scale-110",
                mood === m && "bg-primary/10",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 px-3">
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Button>
      </div>

      <div onBlur={handleBlurSave}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
