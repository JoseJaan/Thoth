import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  BookOpen,
  FileText,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { trpc } from "../../trpc";
import DocumentNoteEditor from "./DocumentNoteEditor";
import { useDebouncedCallback } from "../../hooks/useDebounce";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const statusOptions = [
  { value: "unread", label: "Nao lido", color: "#94a3b8" },
  { value: "to_read", label: "Para ler", color: "#f59e0b" },
  { value: "reading", label: "Lendo", color: "#3b82f6" },
  { value: "read", label: "Lido", color: "#10b981" },
];

interface DocumentViewerProps {
  documentId: string;
  onBack: () => void;
}

export default function DocumentViewer({ documentId, onBack }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const doc = trpc.documents.getById.useQuery({ id: documentId });
  const docNotes = trpc.documents.listNotes.useQuery({ documentId });
  const updateDoc = trpc.documents.update.useMutation();
  const createNote = trpc.documents.createNote.useMutation();
  const deleteNote = trpc.documents.deleteNote.useMutation();
  const utils = trpc.useUtils();

  // Track current page via IntersectionObserver
  useEffect(() => {
    if (numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNum = Number(entry.target.getAttribute("data-page"));
            if (pageNum) setCurrentPage(pageNum);
          }
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "200px 0px",
        threshold: 0.1,
      }
    );

    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages]);

  // Buffer: only render pages near the current one
  const PAGE_BUFFER = 3;
  const isPageVisible = (pageNum: number) =>
    Math.abs(pageNum - currentPage) <= PAGE_BUFFER;

  const setPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
    if (el) {
      pageRefs.current.set(pageNum, el);
    } else {
      pageRefs.current.delete(pageNum);
    }
  }, []);

  if (!doc.data) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-slate-400">Carregando...</span>
      </div>
    );
  }

  const pdfUrl = `/uploads/${doc.data.filePath}`;

  const handleStatusChange = (status: string) => {
    updateDoc.mutate(
      { id: documentId, readingStatus: status as any },
      { onSuccess: () => {
        utils.documents.getById.invalidate({ id: documentId });
        utils.documents.list.invalidate();
      }}
    );
  };

  const handleAddNote = async () => {
    await createNote.mutateAsync({
      documentId,
      pageNumber: currentPage,
    });
    utils.documents.listNotes.invalidate({ documentId });
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote.mutateAsync({ id: noteId });
    utils.documents.listNotes.invalidate({ documentId });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 bg-white shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>

        <h3 className="text-sm font-medium text-slate-800 truncate flex-1">
          {doc.data.title}
        </h3>

        {/* Status selector */}
        <div className="flex gap-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                doc.data!.readingStatus === opt.value
                  ? "text-white shadow-sm"
                  : "hover:opacity-80"
              }`}
              style={{
                backgroundColor:
                  doc.data!.readingStatus === opt.value ? opt.color : `${opt.color}20`,
                color: doc.data!.readingStatus === opt.value ? "white" : opt.color,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content: PDF + Notes side by side */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col bg-slate-100">
          {/* Page indicator + Zoom controls */}
          <div className="flex items-center justify-center gap-4 py-2 bg-white border-b border-slate-100">
            <span className="text-sm text-slate-600">
              {currentPage} / {numPages}
            </span>
            <div className="w-px h-5 bg-slate-200 mx-2" />
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs text-slate-500 w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(3, scale + 0.1))}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* PDF rendering - continuous scroll */}
          <div ref={scrollContainerRef} className="flex-1 overflow-auto">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="flex items-center justify-center py-20">
                  <span className="text-slate-400">Carregando PDF...</span>
                </div>
              }
              error={
                <div className="flex items-center justify-center py-20">
                  <span className="text-red-400">Erro ao carregar PDF</span>
                </div>
              }
            >
              <div className="flex flex-col items-center gap-4 p-4">
                {Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={i + 1}
                    ref={(el) => setPageRef(i + 1, el)}
                    data-page={i + 1}
                    style={!isPageVisible(i + 1) ? { height: `${Math.round(800 * scale)}px`, width: `${Math.round(600 * scale)}px` } : undefined}
                  >
                    {isPageVisible(i + 1) && (
                      <Page
                        pageNumber={i + 1}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Document>
          </div>
        </div>

        {/* Notes panel */}
        <div className="w-96 border-l border-slate-200 bg-white flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Anotacoes
              </span>
              <span className="text-xs text-slate-400">
                ({docNotes.data?.length || 0})
              </span>
            </div>
            <button
              onClick={handleAddNote}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus size={12} />
              Pagina {currentPage}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-3">
            {/* General Summary */}
            <SummaryEditor
              documentId={documentId}
              initialSummary={doc.data!.summary}
            />

            {docNotes.data?.map((note: any) => (
              <div
                key={note.id}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs text-slate-500">
                    {note.pageNumber ? `Pagina ${note.pageNumber}` : "Geral"}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-0.5 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 size={11} className="text-red-400" />
                  </button>
                </div>
                <DocumentNoteEditor
                  noteId={note.id}
                  initialContent={note.content}
                />
              </div>
            ))}

            {docNotes.data?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400">
                  Nenhuma anotacao ainda.
                  <br />
                  Clique em + para adicionar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryEditor({ documentId, initialSummary }: { documentId: string; initialSummary: string | null }) {
  const updateDoc = trpc.documents.update.useMutation();

  const debouncedSave = useDebouncedCallback(
    (summary: string) => {
      updateDoc.mutate({ id: documentId, summary });
    },
    1000
  );

  const parseContent = useCallback(() => {
    if (!initialSummary) return undefined;
    try {
      const parsed = JSON.parse(initialSummary);
      if (parsed && typeof parsed === "object" && parsed.type) return parsed;
    } catch {}
    return undefined;
  }, [initialSummary]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Escreva um resumo geral do documento...",
      }),
    ],
    content: parseContent(),
    onUpdate: ({ editor }) => {
      debouncedSave(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-slate max-w-none focus:outline-none p-3 min-h-[60px]",
      },
    },
  });

  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50/30">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-b border-amber-200">
        <FileText size={12} className="text-amber-600" />
        <span className="text-xs font-medium text-amber-700">Resumo Geral</span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
