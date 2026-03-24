import { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { trpc } from "../../trpc";
import { useDebouncedCallback } from "../../hooks/useDebounce";

interface DocumentNoteEditorProps {
  noteId: string;
  initialContent: string;
}

export default function DocumentNoteEditor({ noteId, initialContent }: DocumentNoteEditorProps) {
  const updateNote = trpc.documents.updateNote.useMutation();

  const debouncedSave = useDebouncedCallback(
    (data: { content?: string; contentText?: string }) => {
      updateNote.mutate({ id: noteId, ...data });
    },
    1000
  );

  const parseContent = useCallback(() => {
    try {
      const parsed = JSON.parse(initialContent);
      if (parsed && typeof parsed === "object" && parsed.type) {
        return parsed;
      }
    } catch {}
    return undefined;
  }, [initialContent]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Escreva sua anotacao...",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: parseContent(),
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      const text = editor.getText();
      debouncedSave({ content: json, contentText: text });
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-slate max-w-none focus:outline-none p-3 min-h-[60px]",
      },
    },
  });

  return <EditorContent editor={editor} />;
}
