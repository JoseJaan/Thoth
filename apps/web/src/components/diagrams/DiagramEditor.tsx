import { useState, useCallback, useRef, useEffect, Component, type ReactNode } from "react";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import { trpc } from "../../trpc";
import { useDebouncedCallback } from "../../hooks/useDebounce";

// Lazy import Excalidraw to avoid SSR issues
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";

// ErrorBoundary to catch Excalidraw canvas errors
class ExcalidrawErrorBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
          <p className="text-sm">Erro ao renderizar o diagrama.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onRetry();
            }}
            className="px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface DiagramEditorProps {
  diagramId: string;
  onBack: () => void;
}

export default function DiagramEditor({ diagramId, onBack }: DiagramEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [ready, setReady] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Wait for container to have real dimensions before rendering Excalidraw
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setReady(true);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const diagram = trpc.diagrams.getById.useQuery({ id: diagramId });
  const updateDiagram = trpc.diagrams.update.useMutation();

  // Only mark data as loaded once query has fresh data (not stale cache)
  useEffect(() => {
    if (!initialDataLoaded && diagram.data && !diagram.isFetching) {
      setInitialDataLoaded(true);
    }
  }, [initialDataLoaded, diagram.data, diagram.isFetching]);

  // Sync title from fetched data (via effect, not during render)
  useEffect(() => {
    if (diagram.data?.title && !title) {
      setTitle(diagram.data.title);
    }
  }, [diagram.data?.title]);

  const debouncedSave = useDebouncedCallback(
    (data: string) => {
      updateDiagram.mutate({ id: diagramId, data });
    },
    2000
  );

  const handleChange = useCallback(
    (elements: any[], appState: any, files: any) => {
      // Only save if there are elements
      if (elements.length > 0) {
        const data = JSON.stringify({
          elements,
          appState: { viewBackgroundColor: appState.viewBackgroundColor },
          files: files ?? {},
        });
        debouncedSave(data);
      }
    },
    [debouncedSave]
  );

  const handleSaveThumbnail = async () => {
    const api = excalidrawAPI;
    if (!api) return;
    try {
      const allElements = api.getSceneElements();
      const elements = allElements.filter((el: any) => !el.isDeleted);
      if (elements.length === 0) return;

      const files = api.getFiles();
      const blob = await exportToBlob({
        elements,
        appState: {
          exportWithDarkMode: false,
          viewBackgroundColor: "#ffffff",
        },
        files: files ?? null,
        mimeType: "image/png" as any,
        maxWidthOrHeight: 320,
      });

      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          updateDiagram.mutate(
            { id: diagramId, thumbnail: base64 },
            { onSettled: () => resolve() }
          );
        };
        reader.readAsDataURL(blob);
      });
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
    // Cancel pending debounced save — we'll save directly from the API
    debouncedSave.cancel();

    // Save current scene data directly and await completion
    if (excalidrawAPI) {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        const files = excalidrawAPI.getFiles();

        if (elements.length > 0) {
          const data = JSON.stringify({
            elements,
            appState: { viewBackgroundColor: appState.viewBackgroundColor },
            files: files ?? {},
          });
          await updateDiagram.mutateAsync({ id: diagramId, data });
        }
      } catch (err) {
        console.error("Error saving diagram data:", err);
      }

      await handleSaveThumbnail();
    }

    // Invalidate cache so next open gets fresh data from the server
    await utils.diagrams.getById.invalidate();

    onBack();
  };

  // Parse initial data
  let initialElements: any[] = [];
  let initialAppState: any = undefined;
  let initialFiles: any = undefined;
  if (diagram.data) {
    try {
      const parsed = JSON.parse(diagram.data.data);
      if (parsed.elements) initialElements = parsed.elements;
      if (parsed.appState) initialAppState = parsed.appState;
      if (parsed.files) initialFiles = parsed.files;
    } catch {}
  }

  const canRenderExcalidraw = ready && initialDataLoaded;

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
            {title || diagram.data?.title || "..."}
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

      {/* Excalidraw canvas — container always renders so ResizeObserver works */}
      <div ref={containerRef} className="flex-1 relative" style={{ minHeight: 0 }}>
        {canRenderExcalidraw ? (
          <ExcalidrawErrorBoundary onRetry={() => setRenderKey((k) => k + 1)}>
            <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
              <Excalidraw
                key={renderKey}
                excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                initialData={{
                  elements: initialElements,
                  appState: {
                    ...initialAppState,
                    theme: "light",
                  },
                  files: initialFiles,
                }}
                onChange={handleChange}
                langCode="pt-BR"
              />
            </div>
          </ExcalidrawErrorBoundary>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-slate-400">Carregando...</span>
          </div>
        )}
      </div>
    </div>
  );
}
