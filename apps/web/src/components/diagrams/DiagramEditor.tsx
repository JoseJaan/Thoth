import { useState, useCallback, useRef } from "react";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import { trpc } from "../../trpc";
import { useDebouncedCallback } from "../../hooks/useDebounce";

// Lazy import Excalidraw to avoid SSR issues
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";

interface DiagramEditorProps {
  diagramId: string;
  onBack: () => void;
}

export default function DiagramEditor({ diagramId, onBack }: DiagramEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const excalidrawRef = useRef<any>(null);

  const diagram = trpc.diagrams.getById.useQuery({ id: diagramId });
  const updateDiagram = trpc.diagrams.update.useMutation();

  const debouncedSave = useDebouncedCallback(
    (data: string) => {
      updateDiagram.mutate({ id: diagramId, data });
    },
    2000
  );

  const handleChange = useCallback(
    (elements: any[], appState: any) => {
      // Only save if there are elements
      if (elements.length > 0) {
        const data = JSON.stringify({ elements, appState: { viewBackgroundColor: appState.viewBackgroundColor } });
        debouncedSave(data);
      }
    },
    [debouncedSave]
  );

  const handleSaveThumbnail = async () => {
    if (!excalidrawRef.current) return;
    try {
      const elements = excalidrawRef.current.getSceneElements();
      if (elements.length === 0) return;

      const blob = await exportToBlob({
        elements,
        mimeType: "image/png",
        getDimensions: () => ({ width: 320, height: 200, scale: 1 }),
        files: excalidrawRef.current.getFiles(),
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateDiagram.mutate({ id: diagramId, thumbnail: base64 });
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Error generating thumbnail:", err);
    }
  };

  const handleTitleSave = () => {
    if (title.trim()) {
      updateDiagram.mutate({ id: diagramId, title: title.trim() });
    }
    setEditingTitle(false);
  };

  const handleBack = async () => {
    await handleSaveThumbnail();
    onBack();
  };

  if (!diagram.data) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-slate-400">Carregando...</span>
      </div>
    );
  }

  // Parse initial data
  let initialElements: any[] = [];
  let initialAppState: any = undefined;
  try {
    const parsed = JSON.parse(diagram.data.data);
    if (parsed.elements) initialElements = parsed.elements;
    if (parsed.appState) initialAppState = parsed.appState;
  } catch {}

  if (!title && diagram.data.title) {
    setTitle(diagram.data.title);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 bg-white shrink-0 z-10">
        <button
          onClick={handleBack}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>

        {editingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
            className="text-sm font-medium text-slate-800 outline-none border-b-2 border-purple-400 bg-transparent px-1"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-800 hover:text-purple-600 transition-colors"
          >
            {title || diagram.data.title}
            <Edit3 size={12} className="text-slate-400" />
          </button>
        )}

        <div className="flex-1" />

        {updateDiagram.isPending && (
          <span className="text-xs text-slate-400">Salvando...</span>
        )}

        <button
          onClick={handleSaveThumbnail}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Save size={13} />
          Salvar thumbnail
        </button>
      </div>

      {/* Excalidraw canvas */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
        <Excalidraw
          ref={excalidrawRef}
          initialData={{
            elements: initialElements,
            appState: {
              ...initialAppState,
              theme: "light",
            },
          }}
          onChange={handleChange}
          langCode="pt-BR"
        />
        </div>
      </div>
    </div>
  );
}
