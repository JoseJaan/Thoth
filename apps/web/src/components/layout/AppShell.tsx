import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import NotesPage from "../../pages/NotesPage";
import DocumentsPage from "../../pages/DocumentsPage";
import DiagramsPage from "../../pages/DiagramsPage";
import TasksPage from "../../pages/TasksPage";
import DashboardPage from "../../pages/DashboardPage";
import QuickCapture from "../QuickCapture";
import PomodoroTimer from "../PomodoroTimer";

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
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

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
        return <DocumentsPage />;
      case "diagrams":
        return <DiagramsPage />;
      case "tasks":
        return <TasksPage />;
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
          onTogglePomodoro={() => setPomodoroOpen(!pomodoroOpen)}
          pomodoroOpen={pomodoroOpen}
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

      <PomodoroTimer isOpen={pomodoroOpen} onClose={() => setPomodoroOpen(false)} />
    </div>
  );
}
