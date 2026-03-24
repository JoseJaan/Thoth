import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { trpc } from "../trpc";

const presetColors = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
];

interface TagManagerProps {
  entityId: string;
  entityType: "note" | "document" | "diagram" | "task";
}

export default function TagManager({ entityId, entityType }: TagManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(presetColors[0]);

  const allTags = trpc.tags.list.useQuery();
  const entityTags = trpc.tags.getForEntity.useQuery({ entityId, entityType });
  const createTag = trpc.tags.create.useMutation();
  const addTag = trpc.tags.addToEntity.useMutation();
  const removeTag = trpc.tags.removeFromEntity.useMutation();
  const utils = trpc.useUtils();

  const entityTagIds = new Set((entityTags.data || []).map((t: any) => t.id));
  const availableTags = (allTags.data || []).filter((t: any) => !entityTagIds.has(t.id));

  const handleCreateAndAdd = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag.mutateAsync({ name: newTagName.trim(), color: selectedColor });
    await addTag.mutateAsync({ tagId: tag.id, entityId, entityType });
    utils.tags.list.invalidate();
    utils.tags.getForEntity.invalidate({ entityId, entityType });
    setNewTagName("");
    setShowAdd(false);
  };

  const handleAddExisting = async (tagId: string) => {
    await addTag.mutateAsync({ tagId, entityId, entityType });
    utils.tags.getForEntity.invalidate({ entityId, entityType });
  };

  const handleRemove = async (tagId: string) => {
    await removeTag.mutateAsync({ tagId, entityId, entityType });
    utils.tags.getForEntity.invalidate({ entityId, entityType });
  };

  return (
    <div className="space-y-2">
      {/* Current tags */}
      <div className="flex flex-wrap gap-1.5">
        {entityTags.data?.map((tag: any) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => handleRemove(tag.id)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-slate-400 border border-dashed border-slate-300 hover:border-slate-400 hover:text-slate-600 transition-colors"
        >
          <Plus size={10} />
          Tag
        </button>
      </div>

      {/* Add tag dropdown */}
      {showAdd && (
        <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-lg space-y-2">
          {/* Existing tags */}
          {availableTags.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-400 uppercase mb-1">Existentes</p>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag: any) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddExisting(tag.id)}
                    className="px-2 py-0.5 rounded-full text-xs text-white hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: tag.color }}
                  >
                    + {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create new */}
          <div>
            <p className="text-[10px] text-slate-400 uppercase mb-1">Create new</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
                placeholder="Tag name"
                className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-indigo-400"
                autoFocus
              />
              <button
                onClick={handleCreateAndAdd}
                disabled={!newTagName.trim()}
                className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
              >
                Create
              </button>
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    selectedColor === c ? "scale-125 ring-2 ring-offset-1 ring-slate-300" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
