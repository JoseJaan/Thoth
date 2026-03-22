import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import NotesPage from "../../pages/NotesPage";
import DashboardPage from "../../pages/DashboardPage";
import QuickCapture from "../QuickCapture";

const pageConfig: Record<string, { title: string; color: string }> = {
  dashboard: { title: "Inicio", color: "var(--color-primary)" },
  notes: { title: "Notas", color: "var(--color-notes)" },
  documents: { title: "Documentos", color: "var(--color-documents)" },
  diagrams: { title: "Diagramas", color: "var(--color-diagrams)" },
  tasks: { title: "Tarefas", color: "var(--color-tasks)" },
};

export default function AppShell() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      setQuickCaptureOpen(true);
    }
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const config = pageConfig[currentPage] || pageConfig.dashboard;

  const renderPage = () => {
    switch (currentPage) {
      case "notes":
        return <NotesPage selectedNoteId={selectedNoteId} onSelectNote={setSelectedNoteId} />;
      case "documents":
        return <PlaceholderPage name="Documentos" color="var(--color-documents)" />;
      case "diagrams":
        return <PlaceholderPage name="Diagramas" color="var(--color-diagrams)" />;
      case "tasks":
        return <PlaceholderPage name="Tarefas" color="var(--color-tasks)" />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={config.title}
          color={config.color}
          onQuickCapture={() => setQuickCaptureOpen(true)}
        />
        <div className="flex-1 overflow-auto">{renderPage()}</div>
      </main>

      {quickCaptureOpen && (
        <QuickCapture
          onClose={() => setQuickCaptureOpen(false)}
          onNoteCreated={(id) => {
            setSelectedNoteId(id);
            setCurrentPage("notes");
            setQuickCaptureOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PlaceholderPage({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl"
          style={{ backgroundColor: color }}
        >
          {name[0]}
        </div>
        <h3 className="text-lg font-semibold text-slate-700">{name}</h3>
        <p className="text-sm text-slate-400">Em breve...</p>
      </div>
    </div>
  );
}
