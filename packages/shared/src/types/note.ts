export interface Note {
  id: string;
  title: string;
  content: string; // JSON Tiptap document
  contentText: string; // Plain text for search
  parentId: string | null;
  isFolder: boolean;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateNoteInput = Pick<Note, "title"> &
  Partial<Pick<Note, "content" | "parentId" | "isFolder" | "icon">>;

export type UpdateNoteInput = Partial<
  Pick<Note, "title" | "content" | "contentText" | "parentId" | "icon" | "sortOrder">
>;
