import { useState } from "react";
import {
  FileText,
  FolderOpen,
  BookOpen,
  PenTool,
  CheckSquare,
  Brain,
  Home,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  MoreHorizontal,
  Trash2,
  Edit3,
} from "lucide-react";
import { trpc } from "../../trpc";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Inicio", icon: <Home size={18} />, color: "var(--color-primary)", path: "dashboard" },
  { id: "notes", label: "Notas", icon: <FileText size={18} />, color: "var(--color-notes)", path: "notes" },
  { id: "documents", label: "Documentos", icon: <BookOpen size={18} />, color: "var(--color-documents)", path: "documents" },
  { id: "diagrams", label: "Diagramas", icon: <PenTool size={18} />, color: "var(--color-diagrams)", path: "diagrams" },
  { id: "tasks", label: "Tarefas", icon: <CheckSquare size={18} />, color: "var(--color-tasks)", path: "tasks" },
  { id: "flashcards", label: "Flashcards", icon: <Brain size={18} />, color: "var(--color-flashcards)", path: "flashcards" },
];

interface NoteTreeItemProps {
  note: {
    id: string;
    title: string;
    isFolder: boolean;
    icon: string | null;
  };
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  level: number;
}

function NoteTreeItem({ note, selectedNoteId, onSelect, onDelete, level }: NoteTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const children = trpc.notes.list.useQuery(
    { parentId: note.id },
    { enabled: note.isFolder && expanded }
  );

  const isSelected = selectedNoteId === note.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer text-sm transition-colors ${
          isSelected
            ? "bg-amber-100 text-amber-900 font-medium"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => {
          if (note.isFolder) {
            setExpanded(!expanded);
          }
          onSelect(note.id);
        }}
      >
        {note.isFolder ? (
          expanded ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />
        ) : (
          <File size={14} className="text-slate-400 shrink-0" />
        )}
        <span className="truncate flex-1">
          {note.icon ? `${note.icon} ` : ""}
          {note.title || "Sem título"}
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreHorizontal size={12} />
        </button>
        {showMenu && (
          <div className="absolute right-2 mt-6 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 w-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
                setShowMenu(false);
              }}
            >
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        )}
      </div>
      {note.isFolder && expanded && children.data && (
        <div>
          {children.data.map((child: any) => (
            <NoteTreeItem
              key={child.id}
              note={child}
              selectedNoteId={selectedNoteId}
              onSelect={onSelect}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onOpenSearch: () => void;
}

export default function Sidebar({
  currentPage,
  onPageChange,
  selectedNoteId,
  onSelectNote,
  onOpenSearch,
}: SidebarProps) {
  const rootNotes = trpc.notes.list.useQuery({});
  const createNote = trpc.notes.create.useMutation();
  const deleteNote = trpc.notes.delete.useMutation();
  const utils = trpc.useUtils();

  const handleCreateNote = async (isFolder: boolean) => {
    const note = await createNote.mutateAsync({
      title: isFolder ? "Nova pasta" : "Sem título",
      isFolder,
      parentId: null,
      content: "{}",
      icon: null,
    });
    utils.notes.list.invalidate();
    if (!isFolder) {
      onSelectNote(note.id);
      onPageChange("notes");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNote.mutateAsync({ id });
    utils.notes.list.invalidate();
    if (selectedNoteId === id) {
      onSelectNote("");
    }
  };

  return (
    <aside className="w-64 h-screen bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-diagrams)] to-[var(--color-flashcards)] bg-clip-text text-transparent">
          Thoth
        </h1>
      </div>

      {/* Search */}
      <button
        onClick={onOpenSearch}
        className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">Ctrl+Shift+K</kbd>
      </button>

      {/* Navigation */}
      <nav className="mt-4 px-3 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.path)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === item.path
                ? "text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:shadow-sm"
            }`}
            style={
              currentPage === item.path
                ? { backgroundColor: item.color }
                : {}
            }
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Notes Tree */}
      <div className="mt-4 flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Notas
          </span>
          <div className="flex gap-0.5">
            <button
              onClick={() => handleCreateNote(true)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              title="Nova pasta"
            >
              <Folder size={13} className="text-slate-400" />
            </button>
            <button
              onClick={() => handleCreateNote(false)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              title="Nova nota"
            >
              <Plus size={13} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="space-y-0.5">
          {rootNotes.data?.map((note: any) => (
            <NoteTreeItem
              key={note.id}
              note={note}
              selectedNoteId={selectedNoteId}
              onSelect={(id) => {
                onSelectNote(id);
                onPageChange("notes");
              }}
              onDelete={handleDelete}
              level={0}
            />
          ))}
          {rootNotes.data?.length === 0 && (
            <p className="text-xs text-slate-400 px-2 py-4 text-center">
              Nenhuma nota ainda.
              <br />
              Clique em + para criar.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
