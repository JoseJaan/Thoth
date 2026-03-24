import { useState, useEffect, useRef } from "react";
import { Search, FileText, BookOpen, PenTool, CheckSquare, X } from "lucide-react";
import { trpc } from "../../trpc";

const typeConfig = {
  note: { icon: <FileText size={14} />, color: "var(--color-notes)", label: "Note" },
  document: { icon: <BookOpen size={14} />, color: "var(--color-documents)", label: "Document" },
  diagram: { icon: <PenTool size={14} />, color: "var(--color-diagrams)", label: "Diagram" },
  task: { icon: <CheckSquare size={14} />, color: "var(--color-tasks)", label: "Task" },
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (type: string, id: string) => void;
}

export default function GlobalSearch({ isOpen, onClose, onSelectResult }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = trpc.search.global.useQuery(
    { query },
    { enabled: query.length >= 2 }
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allResults = [
    ...(searchResults.data?.notes || []),
    ...(searchResults.data?.documents || []),
    ...(searchResults.data?.diagrams || []),
    ...(searchResults.data?.tasks || []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden border border-slate-200">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, documents, diagrams, tasks..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-300"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-0.5 hover:bg-slate-100 rounded">
              <X size={14} className="text-slate-400" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-400">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-auto">
          {query.length < 2 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              Type at least 2 characters to search
            </div>
          )}

          {query.length >= 2 && searchResults.isLoading && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              Searching...
            </div>
          )}

          {query.length >= 2 && allResults.length === 0 && !searchResults.isLoading && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No results found
            </div>
          )}

          {allResults.length > 0 && (
            <div className="py-2">
              {allResults.map((result) => {
                const cfg = typeConfig[result.type];
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => {
                      onSelectResult(result.type, result.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {result.title}
                      </div>
                      {result.snippet && (
                        <div className="text-xs text-slate-400 truncate">
                          {result.snippet}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
