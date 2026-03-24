import { useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Flag,
  GripVertical,
  X,
  CheckSquare,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { trpc } from "../trpc";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useDebouncedCallback } from "../hooks/useDebounce";

const columns = [
  { id: "todo", label: "To do", color: "#94a3b8", bg: "#f1f5f9" },
  { id: "in_progress", label: "In progress", color: "#3b82f6", bg: "#dbeafe" },
  { id: "done", label: "Done", color: "#10b981", bg: "#d1fae5" },
] as const;

const priorityConfig = {
  low: { label: "Low", color: "#94a3b8", icon: "↓" },
  medium: { label: "Medium", color: "#f59e0b", icon: "→" },
  high: { label: "High", color: "#ef4444", icon: "↑" },
};

interface TaskCardProps {
  task: any;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableTaskCard({ task, onSelect, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all"
      onClick={() => onSelect(task.id)}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing p-0.5">
          <GripVertical size={14} className="text-slate-300" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-800 truncate">{task.title}</h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ color: priority.color, backgroundColor: `${priority.color}15` }}
            >
              {priority.icon} {priority.label}
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                <Calendar size={10} />
                {new Date(task.dueDate).toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
        >
          <Trash2 size={12} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}

function TaskCardOverlay({ task }: { task: any }) {
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
  return (
    <div className="bg-white rounded-lg border border-emerald-300 p-3 shadow-lg opacity-90 w-[280px]">
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="text-slate-300 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-800 truncate">{task.title}</h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ color: priority.color, backgroundColor: `${priority.color}15` }}
            >
              {priority.icon} {priority.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({ id, bg, children }: { id: string; bg: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors ${isOver ? "ring-2 ring-emerald-400 ring-opacity-50" : ""}`}
      style={{ backgroundColor: bg }}
    >
      {children}
    </div>
  );
}

export default function TasksPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingInColumn, setAddingInColumn] = useState<string | null>(null);

  const allTasks = trpc.tasks.list.useQuery({});
  const createTask = trpc.tasks.create.useMutation();
  const deleteTask = trpc.tasks.delete.useMutation();
  const updateTask = trpc.tasks.update.useMutation();
  const reorderTasks = trpc.tasks.reorder.useMutation();
  const utils = trpc.useUtils();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = (status: string) =>
    (allTasks.data || []).filter((t: any) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTask = allTasks.data?.find((t: any) => t.id === active.id);
    if (!activeTask) return;

    // Determine target column
    let targetStatus: string;
    const overTask = allTasks.data?.find((t: any) => t.id === over.id);
    if (overTask) {
      targetStatus = overTask.status;
    } else {
      // Dropped on column itself
      targetStatus = over.id as string;
    }

    if (activeTask.status !== targetStatus) {
      // Optimistic update
      utils.tasks.list.setData({}, (old: any) =>
        old?.map((t: any) => t.id === activeTask.id ? { ...t, status: targetStatus } : t)
      );
      updateTask.mutate(
        { id: activeTask.id, status: targetStatus as any },
        { onError: () => utils.tasks.list.invalidate() }
      );
    }
  };

  const handleCreate = async (status: string) => {
    if (!newTaskTitle.trim()) return;
    await createTask.mutateAsync({
      title: newTaskTitle.trim(),
      status: status as any,
    });
    utils.tasks.list.invalidate();
    setNewTaskTitle("");
    setAddingInColumn(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTask.mutateAsync({ id });
    utils.tasks.list.invalidate();
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const selectedTask = selectedTaskId
    ? allTasks.data?.find((t: any) => t.id === selectedTaskId)
    : null;

  return (
    <div className="h-full flex">
      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {columns.map((col) => {
              const colTasks = tasksByStatus(col.id);
              return (
                <div
                  key={col.id}
                  className="flex-1 min-w-[280px] flex flex-col"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        {col.label}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setAddingInColumn(col.id)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Plus size={14} className="text-slate-400" />
                    </button>
                  </div>

                  {/* Column body */}
                  <DroppableColumn id={col.id} bg={col.bg}>
                    <SortableContext
                      items={colTasks.map((t: any) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {colTasks.map((task: any) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onSelect={setSelectedTaskId}
                          onDelete={handleDelete}
                        />
                      ))}
                    </SortableContext>

                    {/* Add task inline */}
                    {addingInColumn === col.id && (
                      <div className="bg-white rounded-lg border border-slate-200 p-2">
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreate(col.id);
                            if (e.key === "Escape") setAddingInColumn(null);
                          }}
                          placeholder="Task title..."
                          className="w-full text-sm outline-none bg-transparent"
                          autoFocus
                        />
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => handleCreate(col.id)}
                            className="px-2 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600"
                          >
                            Create
                          </button>
                          <button
                            onClick={() => setAddingInColumn(null)}
                            className="px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </DroppableColumn>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeId && allTasks.data?.find((t: any) => t.id === activeId) ? (
              <TaskCardOverlay task={allTasks.data.find((t: any) => t.id === activeId)!} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

function TaskDetailPanel({ task, onClose }: { task: any; onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const updateTask = trpc.tasks.update.useMutation();
  const utils = trpc.useUtils();

  const debouncedSave = useDebouncedCallback(
    (data: any) => {
      updateTask.mutate(
        { id: task.id, ...data },
        { onSuccess: () => utils.tasks.list.invalidate() }
      );
    },
    1000
  );

  const parseContent = () => {
    try {
      const parsed = JSON.parse(task.description || "{}");
      if (parsed && typeof parsed === "object" && parsed.type) return parsed;
    } catch {}
    return undefined;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Task description..." }),
    ],
    content: parseContent(),
    onUpdate: ({ editor }) => {
      debouncedSave({ description: JSON.stringify(editor.getJSON()) });
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-slate max-w-none focus:outline-none min-h-[100px]",
      },
    },
  });

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-sm font-medium text-slate-700">Details</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            debouncedSave({ title: e.target.value });
          }}
          className="w-full text-lg font-semibold text-slate-800 outline-none bg-transparent"
        />

        {/* Priority */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Priority</label>
          <div className="flex gap-1">
            {(["low", "medium", "high"] as const).map((p) => {
              const cfg = priorityConfig[p];
              return (
                <button
                  key={p}
                  onClick={() => {
                    updateTask.mutate(
                      { id: task.id, priority: p },
                      { onSuccess: () => utils.tasks.list.invalidate() }
                    );
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full transition-all ${
                    task.priority === p ? "text-white" : "hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor: task.priority === p ? cfg.color : `${cfg.color}15`,
                    color: task.priority === p ? "white" : cfg.color,
                  }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Due date</label>
          <input
            type="date"
            value={task.dueDate?.split("T")[0] || ""}
            onChange={(e) => {
              updateTask.mutate(
                { id: task.id, dueDate: e.target.value || null },
                { onSuccess: () => utils.tasks.list.invalidate() }
              );
            }}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-400"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
          <select
            value={task.status}
            onChange={(e) => {
              updateTask.mutate(
                { id: task.id, status: e.target.value as any },
                { onSuccess: () => utils.tasks.list.invalidate() }
              );
            }}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-400"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>{col.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
