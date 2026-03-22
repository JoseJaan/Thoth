import { useState } from "react";
import { FileText, Plus, Tag, X, ArrowLeft } from "lucide-react";
import { trpc } from "../trpc";
import NoteEditor from "../components/editor/NoteEditor";

// Post-it color palette
const postItColors = [
  { bg: "#fef9c3", border: "#fde047", text: "#854d0e" }, // yellow
  { bg: "#fce7f3", border: "#f9a8d4", text: "#9d174d" }, // pink
  { bg: "#dbeafe", border: "#93c5fd", text: "#1e40af" }, // blue
  { bg: "#dcfce7", border: "#86efac", text: "#166534" }, // green
  { bg: "#f3e8ff", border: "#c4b5fd", text: "#6b21a8" }, // purple
  { bg: "#ffedd5", border: "#fdba74", text: "#9a3412" }, // orange
  { bg: "#e0f2fe", border: "#7dd3fc", text: "#075985" }, // cyan
  { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" }, // red
];

function getPostItColor(index: number) {
  return postItColors[index % postItColors.length];
}

function getContentPreview(content: string, maxLength = 120): string {
  try {
    const parsed = JSON.parse(content);
    if (!parsed || !parsed.content) return "";
    const extractText = (node: any): string => {
      if (node.text) return node.text;
      if (node.content) return node.content.map(extractText).join(" ");
      return "";
    };
    const text = extractText(parsed).trim();
    if (text.length > maxLength) return text.slice(0, maxLength) + "...";
    return text;
  } catch {
    return "";
  }
}

interface NotesPageProps {
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

export default function NotesPage({ selectedNoteId, onSelectNote }: NotesPageProps) {
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);

  const allNotes = trpc.notes.listAll.useQuery();
  const allTags = trpc.tags.list.useQuery();
  const note = trpc.notes.getById.useQuery(
    { id: selectedNoteId! },
    { enabled: !!selectedNoteId }
  );
  const createNote = trpc.notes.create.useMutation();
  const utils = trpc.useUtils();

  const handleCreate = async () => {
    const newNote = await createNote.mutateAsync({
      title: "Sem titulo",
      isFolder: false,
      parentId: null,
      content: "{}",
      icon: null,
    });
    utils.notes.list.invalidate();
    utils.notes.listAll.invalidate();
    onSelectNote(newNote.id);
  };

  const toggleTagFilter = (tagId: string) => {
    setFilterTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // If editing a note, show the editor
  if (selectedNoteId && note.data) {
    return (
      <div className="h-full flex flex-col">
        <button
          onClick={() => onSelectNote("")}
          className="flex items-center gap-1.5 px-6 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors border-b border-slate-100 shrink-0"
        >
          <ArrowLeft size={14} />
          Voltar para notas
        </button>
        <div className="flex-1 overflow-auto">
          <NoteEditor key={note.data.id} note={note.data} />
        </div>
      </div>
    );
  }

  if (selectedNoteId && note.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Carregando...</div>
      </div>
    );
  }

  // Filter notes by selected tags
  const notes_ = (allNotes.data ?? []) as Array<any>;
  const filteredNotes =
    filterTagIds.length === 0
      ? notes_
      : notes_.filter((n: any) =>
          filterTagIds.every((tagId) =>
            n.tags?.some((t: any) => t.id === tagId)
          )
        );

  // Collect all unique tags used by notes
  const usedTagIds = new Set<string>();
  notes_.forEach((n: any) => {
    n.tags?.forEach((t: any) => usedTagIds.add(t.id));
  });
  const usedTags = (allTags.data ?? []).filter((t: any) => usedTagIds.has(t.id));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notas</h2>
          <p className="text-sm text-slate-400">
            {filteredNotes.length} nota{filteredNotes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nova nota
        </button>
      </div>

      {/* Tag filters */}
      {usedTags.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Tag size={14} className="text-slate-400" />
          {usedTags.map((tag: any) => {
            const isActive = filterTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTagFilter(tag.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "text-white shadow-sm scale-105"
                    : "text-white/80 opacity-60 hover:opacity-100"
                }`}
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                {isActive && <X size={10} />}
              </button>
            );
          })}
          {filterTagIds.length > 0 && (
            <button
              onClick={() => setFilterTagIds([])}
              className="text-xs text-slate-400 hover:text-slate-600 ml-1"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Post-it grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-amber-100 text-amber-500 mb-4">
            <FileText size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-1">
            {filterTagIds.length > 0 ? "Nenhuma nota com essas tags" : "Nenhuma nota ainda"}
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            {filterTagIds.length > 0
              ? "Tente outros filtros ou crie uma nova nota"
              : "Crie sua primeira nota"}
          </p>
          {filterTagIds.length === 0 && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Criar nota
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredNotes.map((note: any, index: number) => {
            const color = getPostItColor(index);
            const preview = getContentPreview(note.content);

            return (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="group text-left rounded-lg p-4 transition-all hover:scale-[1.03] hover:shadow-lg hover:-rotate-1 active:scale-[0.98]"
                style={{
                  backgroundColor: color.bg,
                  borderLeft: `4px solid ${color.border}`,
                  minHeight: "160px",
                }}
              >
                {/* Title */}
                <h4
                  className="font-semibold text-sm mb-2 line-clamp-2"
                  style={{ color: color.text }}
                >
                  {note.icon ? `${note.icon} ` : ""}
                  {note.title || "Sem titulo"}
                </h4>

                {/* Content preview */}
                {preview && (
                  <p
                    className="text-xs leading-relaxed mb-3 line-clamp-4 opacity-70"
                    style={{ color: color.text }}
                  >
                    {preview}
                  </p>
                )}

                {/* Tags */}
                {note.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                <p className="text-[10px] mt-auto opacity-50" style={{ color: color.text }}>
                  {new Date(note.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
