import { useState, useEffect } from "react";
import {
  BookOpen,
  FolderPlus,
  Upload,
  FolderInput,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Folder,
  Trash2,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { trpc } from "../trpc";
import DocumentViewer from "../components/documents/DocumentViewer";

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  unread: { label: "Unread", color: "#94a3b8", bg: "#f1f5f9" },
  to_read: { label: "To read", color: "#f59e0b", bg: "#fef3c7" },
  reading: { label: "Reading", color: "#3b82f6", bg: "#dbeafe" },
  read: { label: "Read", color: "#10b981", bg: "#d1fae5" },
};

interface DocumentsPageProps {
  selectedDocId?: string | null;
  onSelectDoc?: (id: string | null) => void;
}

export default function DocumentsPage({ selectedDocId: externalSelectedId, onSelectDoc }: DocumentsPageProps) {
  const [selectedDocId, setSelectedDocIdLocal] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showImportFolder, setShowImportFolder] = useState(false);
  const [importPath, setImportPath] = useState("");

  const activeDocId = externalSelectedId ?? selectedDocId;
  const setActiveDocId = onSelectDoc ?? setSelectedDocIdLocal;

  const folders = trpc.documents.listFolders.useQuery({ parentId: currentFolderId });
  const docs = trpc.documents.list.useQuery({
    folderId: currentFolderId,
    readingStatus: statusFilter || undefined,
  });

  const createFolder = trpc.documents.createFolder.useMutation();
  const deleteFolder = trpc.documents.deleteFolder.useMutation();
  const deleteDoc = trpc.documents.delete.useMutation();
  const uploadDoc = trpc.documents.upload.useMutation();
  const importFromFolder = trpc.documents.importFromFolder.useMutation();
  const syncTracked = trpc.documents.syncTrackedFolders.useMutation();
  const utils = trpc.useUtils();

  // Auto-sync tracked folders every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await syncTracked.mutateAsync();
        if (result.imported > 0) {
          utils.documents.list.invalidate();
          utils.documents.listFolders.invalidate();
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith(".pdf")) continue;
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const chunks: string[] = [];
        for (let i = 0; i < bytes.length; i += 8192) {
          chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
        }
        const base64 = btoa(chunks.join(""));
        await uploadDoc.mutateAsync({
          fileName: file.name,
          fileData: base64,
          folderId: currentFolderId,
        });
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
      }
    }
    utils.documents.list.invalidate();
  };

  const handleImportFolder = async () => {
    if (!importPath.trim()) return;
    const result = await importFromFolder.mutateAsync({
      folderPath: importPath.trim(),
      targetFolderId: currentFolderId,
    });
    utils.documents.list.invalidate();
    utils.documents.listFolders.invalidate();
    if (result.folderId) {
      setCurrentFolderId(result.folderId);
    }
    setShowImportFolder(false);
    setImportPath("");
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Folder name:");
    if (!name) return;
    await createFolder.mutateAsync({ name, parentId: currentFolderId });
    utils.documents.listFolders.invalidate();
  };

  const handleDeleteDoc = async (id: string) => {
    const deleteFile = window.confirm("Do you also want to delete the PDF file from disk?");
    await deleteDoc.mutateAsync({ id, deleteFile });
    utils.documents.list.invalidate();
    if (activeDocId === id) setActiveDocId(null);
  };

  // If a document is selected, show the viewer
  if (activeDocId) {
    return (
      <DocumentViewer
        documentId={activeDocId}
        onBack={() => setActiveDocId(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Documents</h2>
          <p className="text-sm text-slate-400">
            Manage your PDFs and articles
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const result = await syncTracked.mutateAsync();
                utils.documents.list.invalidate();
                utils.documents.listFolders.invalidate();
              } catch {}
            }}
            disabled={syncTracked.isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Sync tracked folders"
          >
            <RefreshCw size={15} className={syncTracked.isPending ? "animate-spin" : ""} />
            Sync
          </button>
          <button
            onClick={handleCreateFolder}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FolderPlus size={15} />
            Folder
          </button>
          <button
            onClick={() => setShowImportFolder(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FolderInput size={15} />
            Import folder
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
            <Upload size={15} />
            Upload
            <input
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* Import folder modal */}
      {showImportFolder && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-medium text-blue-800 mb-2">Import PDFs from a folder</p>

          {/* Option 1: Select folder via file explorer */}
          <div className="flex gap-2 mb-3">
            <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
              <FolderInput size={16} className="text-blue-500" />
              <span className="text-blue-700">Select folder from explorer</span>
              <input
                type="file"
                {...({ webkitdirectory: "", directory: "" } as any)}
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  const pdfFiles = Array.from(files).filter((f) =>
                    f.name.toLowerCase().endsWith(".pdf")
                  );
                  if (pdfFiles.length === 0) return;

                  // Extract folder name from webkitRelativePath
                  const firstPath = pdfFiles[0].webkitRelativePath;
                  const folderName = firstPath ? firstPath.split("/")[0] : "Imported";

                  // Create a folder for the imported files
                  const folder = await createFolder.mutateAsync({
                    name: folderName,
                    parentId: currentFolderId,
                  });

                  for (const file of pdfFiles) {
                    try {
                      const buffer = await file.arrayBuffer();
                      const bytes = new Uint8Array(buffer);
                      const chunks: string[] = [];
                      for (let i = 0; i < bytes.length; i += 8192) {
                        chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
                      }
                      const base64 = btoa(chunks.join(""));
                      await uploadDoc.mutateAsync({
                        fileName: file.name,
                        fileData: base64,
                        folderId: folder.id,
                      });
                    } catch (err) {
                      console.error(`Error uploading ${file.name}:`, err);
                    }
                  }

                  utils.documents.list.invalidate();
                  utils.documents.listFolders.invalidate();
                  setCurrentFolderId(folder.id);
                  setShowImportFolder(false);
                }}
              />
            </label>
          </div>

          {/* Option 2: Type path manually (server-side) */}
          <p className="text-xs text-blue-600 mb-1">Or type the folder path on the server:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={importPath}
              onChange={(e) => setImportPath(e.target.value)}
              placeholder="C:\path\to\folder\with\pdfs"
              className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400"
            />
            <button
              onClick={handleImportFolder}
              disabled={importFromFolder.isPending}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {importFromFolder.isPending ? "Importing..." : "Import"}
            </button>
            <button
              onClick={() => setShowImportFolder(false)}
              className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
          {importFromFolder.isSuccess && (
            <p className="text-sm text-green-600 mt-2">
              {importFromFolder.data.imported} PDFs imported!
            </p>
          )}
          {uploadDoc.isPending && (
            <p className="text-sm text-blue-500 mt-2">Uploading PDFs...</p>
          )}
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            !statusFilter ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {Object.entries(statusLabels).map(([key, { label, color, bg }]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? null : key)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              statusFilter === key ? "text-white" : "hover:opacity-80"
            }`}
            style={{
              backgroundColor: statusFilter === key ? color : bg,
              color: statusFilter === key ? "white" : color,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      {currentFolderId && (
        <div className="flex items-center gap-1 mb-4 text-sm">
          <button
            onClick={() => setCurrentFolderId(null)}
            className="text-blue-500 hover:underline"
          >
            Root
          </button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-600">Current folder</span>
        </div>
      )}

      {/* Folders */}
      {folders.data && folders.data.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {folders.data.map((folder: any) => (
            <div
              key={folder.id}
              className="group flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-colors"
              onClick={() => setCurrentFolderId(folder.id)}
            >
              <Folder size={18} className="text-blue-400" />
              <span className="text-sm font-medium text-slate-700 truncate flex-1">
                {folder.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete folder "${folder.name}"?`)) {
                    deleteFolder.mutate({ id: folder.id }, {
                      onSuccess: () => utils.documents.listFolders.invalidate(),
                    });
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Documents list */}
      <div className="space-y-2">
        {docs.data?.map((doc: any) => {
          const status = statusLabels[doc.readingStatus] || statusLabels.unread;
          return (
            <div
              key={doc.id}
              className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
              onClick={() => setActiveDocId(doc.id)}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-800 truncate">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {doc.originalName} &middot; {(doc.fileSize / 1024).toFixed(0)} KB
                </p>
              </div>
              <span
                className="px-2.5 py-1 text-xs font-medium rounded-full"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDoc(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg transition-opacity"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          );
        })}

        {docs.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-blue-100 text-blue-400 mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-1">No documents</h3>
            <p className="text-sm text-slate-400">
              Upload PDFs or import from a folder
            </p>
          </div>
        )}

        {(uploadDoc.isPending || importFromFolder.isPending) && (
          <div className="text-center py-4 text-sm text-blue-500">
            Processing...
          </div>
        )}
      </div>

      {/* Drop zone overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    </div>
  );
}
