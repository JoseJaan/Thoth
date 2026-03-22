import { trpc } from "../trpc";
import NoteEditor from "../components/editor/NoteEditor";
import { FileText } from "lucide-react";

interface NotesPageProps {
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

export default function NotesPage({ selectedNoteId, onSelectNote }: NotesPageProps) {
  const note = trpc.notes.getById.useQuery(
    { id: selectedNoteId! },
    { enabled: !!selectedNoteId }
  );

  if (!selectedNoteId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-amber-100 text-amber-500">
            <FileText size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Nenhuma nota selecionada</h3>
          <p className="text-sm text-slate-400">
            Selecione uma nota na sidebar ou crie uma nova com{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Ctrl+Shift+N</kbd>
          </p>
        </div>
      </div>
    );
  }

  if (note.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Carregando...</div>
      </div>
    );
  }

  if (!note.data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Nota nao encontrada</p>
      </div>
    );
  }

  return (
    <NoteEditor
      key={note.data.id}
      note={note.data}
    />
  );
}
