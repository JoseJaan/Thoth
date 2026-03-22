import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { common, createLowlight } from "lowlight";
import { trpc } from "../../trpc";
import { useDebouncedCallback } from "../../hooks/useDebounce";
import EditorToolbar from "./EditorToolbar";
import TagManager from "../TagManager";

const lowlight = createLowlight(common);

interface NoteEditorProps {
  note: {
    id: string;
    title: string;
    content: string;
  };
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const updateNote = trpc.notes.update.useMutation();
  const utils = trpc.useUtils();

  const debouncedSave = useDebouncedCallback(
    (data: { title?: string; content?: string; contentText?: string }) => {
      updateNote.mutate(
        { id: note.id, ...data },
        {
          onSuccess: () => {
            utils.notes.list.invalidate();
          },
        }
      );
    },
    1000
  );

  const parseContent = useCallback(() => {
    try {
      const parsed = JSON.parse(note.content);
      if (parsed && typeof parsed === "object" && parsed.type) {
        return parsed;
      }
    } catch {}
    return undefined;
  }, [note.content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "Comece a escrever...",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false }),
      Image,
      Typography,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: parseContent(),
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      const text = editor.getText();
      debouncedSave({ content: json, contentText: text });
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[calc(100vh-12rem)] px-8 py-4",
      },
    },
  });

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Title */}
      <div className="px-8 pt-6">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Sem titulo"
          className="w-full text-3xl font-bold text-slate-800 outline-none border-none bg-transparent placeholder:text-slate-300"
        />
        <div className="mt-2">
          <TagManager entityId={note.id} entityType="note" />
        </div>
      </div>

      {/* Toolbar */}
      {editor && <EditorToolbar editor={editor} />}

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Status bar */}
      <div className="px-8 py-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
        {updateNote.isPending && <span>Salvando...</span>}
        {updateNote.isSuccess && <span>Salvo</span>}
        {editor && (
          <span>
            {editor.storage.characterCount?.characters?.() ?? editor.getText().length} caracteres
          </span>
        )}
      </div>
    </div>
  );
}
