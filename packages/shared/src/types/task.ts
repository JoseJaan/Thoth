export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null; // JSON Tiptap
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskInput = Pick<Task, "title"> &
  Partial<Pick<Task, "description" | "status" | "priority" | "dueDate">>;

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "status" | "priority" | "dueDate" | "sortOrder">
>;
