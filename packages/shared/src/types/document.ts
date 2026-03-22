export type ReadingStatus = "unread" | "to_read" | "reading" | "read";

export interface Document {
  id: string;
  title: string;
  authors: string | null;
  filePath: string;
  fileSize: number;
  readingStatus: ReadingStatus;
  extractedText: string | null;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface DocumentNote {
  id: string;
  documentId: string;
  content: string; // JSON Tiptap
  contentText: string;
  pageNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateDocumentInput = Pick<Document, "title"> &
  Partial<Pick<Document, "authors" | "folderId">>;

export type UpdateDocumentInput = Partial<
  Pick<Document, "title" | "authors" | "readingStatus" | "folderId">
>;
