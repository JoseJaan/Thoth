import { useState } from "react";
import { PenTool, Plus, Trash2, Clock } from "lucide-react";
import { trpc } from "../trpc";
import DiagramEditor from "../components/diagrams/DiagramEditor";

export default function DiagramsPage() {
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);

  const diagramsList = trpc.diagrams.list.useQuery();
  const createDiagram = trpc.diagrams.create.useMutation();
  const deleteDiagram = trpc.diagrams.delete.useMutation();
  const utils = trpc.useUtils();

  const handleCreate = async () => {
    // Generate incremented name if "New diagram" already exists
    const existing = diagramsList.data ?? [];
    const baseName = "New diagram";
    let finalName = baseName;
    const existingNames = new Set(existing.map((d: any) => d.title));
    if (existingNames.has(finalName)) {
      let i = 1;
      while (existingNames.has(`${baseName}-${i}`)) i++;
      finalName = `${baseName}-${i}`;
    }

    await createDiagram.mutateAsync({
      title: finalName,
      data: "{}",
    });
    utils.diagrams.list.invalidate();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this diagram?")) return;
    await deleteDiagram.mutateAsync({ id });
    utils.diagrams.list.invalidate();
    if (selectedDiagramId === id) setSelectedDiagramId(null);
  };

  if (selectedDiagramId) {
    return (
      <DiagramEditor
        diagramId={selectedDiagramId}
        onBack={() => {
          setSelectedDiagramId(null);
          utils.diagrams.list.invalidate();
        }}
      />
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Diagrams</h2>
          <p className="text-sm text-slate-400">Create and edit your diagrams</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-sm"
        >
          <Plus size={15} />
          New diagram
        </button>
      </div>

      {/* Diagrams grid */}
      <div className="grid grid-cols-3 gap-4">
        {diagramsList.data?.map((diagram: any) => (
          <div
            key={diagram.id}
            className="group border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-lg hover:border-purple-200 cursor-pointer transition-all"
            onClick={() => setSelectedDiagramId(diagram.id)}
          >
            {/* Thumbnail area */}
            <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100">
              {diagram.thumbnail ? (
                <img
                  src={diagram.thumbnail}
                  alt={diagram.title}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <PenTool size={32} className="text-purple-200" />
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-800 truncate flex-1">
                  {diagram.title}
                </h4>
                <button
                  onClick={(e) => handleDelete(diagram.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                <Clock size={11} />
                {new Date(diagram.updatedAt).toLocaleDateString("en-US")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {diagramsList.data?.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-purple-100 text-purple-400 mb-4">
            <PenTool size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-1">No diagrams</h3>
          <p className="text-sm text-slate-400 mb-4">Create your first diagram</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Create diagram
          </button>
        </div>
      )}
    </div>
  );
}
