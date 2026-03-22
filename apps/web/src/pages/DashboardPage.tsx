import { FileText, BookOpen, PenTool, CheckSquare, Sparkles } from "lucide-react";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const sections = [
    {
      label: "Notas",
      description: "Crie e organize suas anotacoes",
      icon: <FileText size={24} />,
      color: "var(--color-notes)",
      bgLight: "#fef3c7",
      path: "notes",
    },
    {
      label: "Documentos",
      description: "Gerencie seus PDFs e artigos",
      icon: <BookOpen size={24} />,
      color: "var(--color-documents)",
      bgLight: "#dbeafe",
      path: "documents",
    },
    {
      label: "Diagramas",
      description: "Desenhe diagramas e fluxogramas",
      icon: <PenTool size={24} />,
      color: "var(--color-diagrams)",
      bgLight: "#ede9fe",
      path: "diagrams",
    },
    {
      label: "Tarefas",
      description: "Organize suas atividades",
      icon: <CheckSquare size={24} />,
      color: "var(--color-tasks)",
      bgLight: "#d1fae5",
      path: "tasks",
    },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Bem-vindo ao Thoth
        </h1>
        <p className="text-slate-500">
          Sua ferramenta pessoal de estudos. Escolha por onde comecar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map((section) => (
          <button
            key={section.path}
            onClick={() => onNavigate(section.path)}
            className="group p-6 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all text-left"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform"
              style={{ backgroundColor: section.color }}
            >
              {section.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              {section.label}
            </h3>
            <p className="text-sm text-slate-400">{section.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-indigo-700">Dica rapida</p>
            <p className="text-xs text-indigo-500">
              Use <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono shadow-sm">Ctrl+N</kbd> para captura rapida e{" "}
              <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono shadow-sm">Ctrl+K</kbd> para buscar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
