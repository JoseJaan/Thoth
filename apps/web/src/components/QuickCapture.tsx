import { useState, useEffect, useRef } from "react";
import { FileText, CheckSquare, X } from "lucide-react";
import { trpc } from "../trpc";

interface QuickCaptureProps {
  onClose: () => void;
  onNoteCreated: (id: string) => void;
}

type CaptureType = "note" | "task";

export default function QuickCapture({ onClose, onNoteCreated }: QuickCaptureProps) {
  const [type, setType] = useState<CaptureType>("note");
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createNote = trpc.notes.create.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === "note") {
      const note = await createNote.mutateAsync({
        title: title.trim(),
        parentId: null,
        isFolder: false,
        content: "{}",
        icon: null,
      });
      utils.notes.list.invalidate();
      onNoteCreated(note.id);
    }
    // TODO: task creation will be added in Phase 4
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-slate-200">
        {/* Type tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setType("note")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              type === "note"
                ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FileText size={16} />
            Nota
          </button>
          <button
            onClick={() => setType("task")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              type === "task"
                ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <CheckSquare size={16} />
            Tarefa
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === "note" ? "Titulo da nota..." : "O que precisa fazer?"
            }
            className="w-full text-lg outline-none border-none bg-transparent placeholder:text-slate-300"
          />
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-400">
              Enter para criar &middot; Esc para fechar
            </p>
            <button
              type="submit"
              disabled={!title.trim() || createNote.isPending}
              className="px-4 py-1.5 text-sm text-white rounded-lg font-medium disabled:opacity-50 transition-opacity"
              style={{
                backgroundColor:
                  type === "note"
                    ? "var(--color-notes)"
                    : "var(--color-tasks)",
              }}
            >
              Criar
            </button>
          </div>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
