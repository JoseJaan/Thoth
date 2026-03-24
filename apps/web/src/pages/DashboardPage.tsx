import { useMemo } from "react";
import {
  FileText,
  BookOpen,
  PenTool,
  CheckSquare,
  Brain,
  Sparkles,
  Zap,
} from "lucide-react";
import { trpc } from "../trpc";

function getGreeting(): { title: string; subtitle: string } {
  const hour = new Date().getHours();

  const timeGreeting =
    hour >= 5 && hour < 12
      ? "Bom dia!"
      : hour >= 12 && hour < 18
        ? "Boa tarde!"
        : "Boa noite!";

  const subtitles = [
    "Bons estudos!",
  ];

  const subtitle = subtitles[Math.floor(Math.random() * subtitles.length)];
  return { title: timeGreeting, subtitle };
}

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const greeting = useMemo(() => getGreeting(), []);
  const notes = trpc.notes.list.useQuery({});
  const documents = trpc.documents.list.useQuery();
  const diagrams = trpc.diagrams.list.useQuery();
  const tasks = trpc.tasks.list.useQuery();
  const flashcardStats = trpc.flashcards.stats.useQuery();

  const sections = [
    {
      label: "Notas",
      description: "Crie e organize suas anotacoes",
      icon: <FileText size={24} />,
      color: "var(--color-notes)",
      path: "notes",
      count: notes.data?.length ?? 0,
    },
    {
      label: "Documentos",
      description: "Gerencie seus PDFs e artigos",
      icon: <BookOpen size={24} />,
      color: "var(--color-documents)",
      path: "documents",
      count: documents.data?.length ?? 0,
    },
    {
      label: "Diagramas",
      description: "Desenhe diagramas e fluxogramas",
      icon: <PenTool size={24} />,
      color: "var(--color-diagrams)",
      path: "diagrams",
      count: diagrams.data?.length ?? 0,
    },
    {
      label: "Tarefas",
      description: "Organize suas atividades",
      icon: <CheckSquare size={24} />,
      color: "var(--color-tasks)",
      path: "tasks",
      count: tasks.data?.length ?? 0,
    },
    {
      label: "Flashcards",
      description: "Estude com repeticao espacada",
      icon: <Brain size={24} />,
      color: "var(--color-flashcards)",
      path: "flashcards",
      count: flashcardStats.data?.total ?? 0,
    },
  ];

  // Recent notes (last 5)
  const recentNotes = (notes.data ?? [])
    .filter((n: any) => !n.isFolder)
    .slice(0, 5);

  // Pending tasks
  const pendingTasks = (tasks.data ?? [])
    .filter((t: any) => t.status !== "done")
    .slice(0, 5);

  // Recent documents
  const recentDocs = (documents.data ?? []).slice(0, 4);

  const dueFlashcards = flashcardStats.data?.due ?? 0;
  const reviewedToday = flashcardStats.data?.reviewedToday ?? 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {greeting.title}
        </h1>
        <p className="text-slate-500">
          {greeting.subtitle}
        </p>
      </div>

      {/* Quick stats row */}
      {(dueFlashcards > 0 || reviewedToday > 0) && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Brain size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {dueFlashcards > 0
                  ? `${dueFlashcards} flashcard${dueFlashcards > 1 ? "s" : ""} pendente${dueFlashcards > 1 ? "s" : ""} para revisao`
                  : "Todos os flashcards revisados!"}
              </p>
              {reviewedToday > 0 && (
                <p className="text-xs text-slate-500">
                  {reviewedToday} revisado{reviewedToday > 1 ? "s" : ""} hoje
                </p>
              )}
            </div>
          </div>
          {dueFlashcards > 0 && (
            <button
              onClick={() => onNavigate("flashcards")}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              <Zap size={14} />
              Revisar agora
            </button>
          )}
        </div>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sections.map((section) => (
          <button
            key={section.path}
            onClick={() => onNavigate(section.path)}
            className="group p-5 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                style={{ backgroundColor: section.color }}
              >
                {section.icon}
              </div>
              {section.count > 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: section.color }}
                >
                  {section.count}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-0.5">
              {section.label}
            </h3>
            <p className="text-xs text-slate-400">{section.description}</p>
          </button>
        ))}
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--color-notes)" }}
              >
                <FileText size={12} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                Notas recentes
              </h3>
            </div>
            <button
              onClick={() => onNavigate("notes")}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Ver todas
            </button>
          </div>
          {recentNotes.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Nenhuma nota ainda
            </p>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note: any) => (
                <div
                  key={note.id}
                  onClick={() => onNavigate("notes")}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <FileText size={14} className="text-amber-500 shrink-0" />
                  <span className="text-sm text-slate-700 truncate flex-1">
                    {note.title || "Sem titulo"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(note.updatedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--color-tasks)" }}
              >
                <CheckSquare size={12} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                Tarefas pendentes
              </h3>
            </div>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Ver todas
            </button>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Nenhuma tarefa pendente
            </p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => onNavigate("tasks")}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      task.priority === "high"
                        ? "bg-red-500"
                        : task.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm text-slate-700 truncate flex-1">
                    {task.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      task.status === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {task.status === "in_progress" ? "Em progresso" : "A fazer"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--color-documents)" }}
              >
                <BookOpen size={12} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                Documentos recentes
              </h3>
            </div>
            <button
              onClick={() => onNavigate("documents")}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Ver todos
            </button>
          </div>
          {recentDocs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Nenhum documento ainda
            </p>
          ) : (
            <div className="space-y-2">
              {recentDocs.map((doc: any) => (
                <div
                  key={doc.id}
                  onClick={() => onNavigate("documents")}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <BookOpen size={14} className="text-blue-500 shrink-0" />
                  <span className="text-sm text-slate-700 truncate flex-1">
                    {doc.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      doc.readingStatus === "read"
                        ? "bg-green-100 text-green-700"
                        : doc.readingStatus === "reading"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {doc.readingStatus === "read"
                      ? "Lido"
                      : doc.readingStatus === "reading"
                        ? "Lendo"
                        : "Nao lido"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flashcards summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--color-flashcards)" }}
              >
                <Brain size={12} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                Flashcards
              </h3>
            </div>
            <button
              onClick={() => onNavigate("flashcards")}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-pink-50">
              <p className="text-2xl font-bold text-pink-600">
                {flashcardStats.data?.total ?? 0}
              </p>
              <p className="text-[10px] text-pink-500 mt-0.5">Total</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50">
              <p className="text-2xl font-bold text-amber-600">
                {flashcardStats.data?.due ?? 0}
              </p>
              <p className="text-[10px] text-amber-500 mt-0.5">Pendentes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-600">
                {flashcardStats.data?.reviewedToday ?? 0}
              </p>
              <p className="text-[10px] text-green-500 mt-0.5">Hoje</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-indigo-700">Dica rapida</p>
            <p className="text-xs text-indigo-500">
              Use{" "}
              <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono shadow-sm">
                Ctrl+Shift+N
              </kbd>{" "}
              para captura rapida e{" "}
              <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono shadow-sm">
                Ctrl+Shift+K
              </kbd>{" "}
              para buscar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
