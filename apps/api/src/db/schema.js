import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
// ===== Notes =====
export const notes = sqliteTable("notes", {
    id: text("id").primaryKey(),
    title: text("title").notNull().default("Sem título"),
    content: text("content").notNull().default("{}"),
    contentText: text("content_text").notNull().default(""),
    parentId: text("parent_id").references(() => notes.id, { onDelete: "set null" }),
    isFolder: integer("is_folder", { mode: "boolean" }).notNull().default(false),
    icon: text("icon"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});
// ===== Documents =====
export const documentFolders = sqliteTable("document_folders", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    parentId: text("parent_id").references(() => documentFolders.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
});
export const documents = sqliteTable("documents", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    authors: text("authors"),
    filePath: text("file_path").notNull(),
    originalName: text("original_name").notNull(),
    fileSize: integer("file_size").notNull(),
    readingStatus: text("reading_status").notNull().default("unread"),
    extractedText: text("extracted_text"),
    summary: text("summary"),
    folderId: text("folder_id").references(() => documentFolders.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});
export const documentNotes = sqliteTable("document_notes", {
    id: text("id").primaryKey(),
    documentId: text("document_id")
        .notNull()
        .references(() => documents.id, { onDelete: "cascade" }),
    content: text("content").notNull().default("{}"),
    contentText: text("content_text").notNull().default(""),
    pageNumber: integer("page_number"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});
// ===== Diagrams =====
export const diagrams = sqliteTable("diagrams", {
    id: text("id").primaryKey(),
    title: text("title").notNull().default("Sem título"),
    data: text("data").notNull().default("{}"),
    thumbnail: text("thumbnail"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});
// ===== Tasks =====
export const tasks = sqliteTable("tasks", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("todo"),
    priority: text("priority").notNull().default("medium"),
    dueDate: text("due_date"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});
// ===== Pomodoro =====
export const pomodoroSessions = sqliteTable("pomodoro_sessions", {
    id: text("id").primaryKey(),
    taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
    duration: integer("duration").notNull(), // in seconds
    startedAt: text("started_at").notNull(),
    completedAt: text("completed_at"),
});
// ===== Flashcards =====
export const flashcards = sqliteTable("flashcards", {
    id: text("id").primaryKey(),
    front: text("front").notNull(),
    back: text("back").notNull(),
    sourceId: text("source_id"),
    sourceType: text("source_type"), // 'note' | 'document'
    nextReview: text("next_review").notNull(),
    interval: integer("interval").notNull().default(1), // days
    easeFactor: text("ease_factor").notNull().default("2.5"),
    repetitions: integer("repetitions").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});
export const flashcardReviews = sqliteTable("flashcard_reviews", {
    id: text("id").primaryKey(),
    flashcardId: text("flashcard_id")
        .notNull()
        .references(() => flashcards.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 0-5
    reviewedAt: text("reviewed_at").notNull(),
});
// ===== Tags =====
export const tags = sqliteTable("tags", {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    color: text("color").notNull().default("#6366f1"),
});
export const taggables = sqliteTable("taggables", {
    tagId: text("tag_id")
        .notNull()
        .references(() => tags.id, { onDelete: "cascade" }),
    taggableId: text("taggable_id").notNull(),
    taggableType: text("taggable_type").notNull(),
}, (table) => [primaryKey({ columns: [table.tagId, table.taggableId, table.taggableType] })]);
// ===== Links =====
export const links = sqliteTable("links", {
    sourceId: text("source_id").notNull(),
    sourceType: text("source_type").notNull(),
    targetId: text("target_id").notNull(),
    targetType: text("target_type").notNull(),
    createdAt: text("created_at").notNull(),
}, (table) => [
    primaryKey({
        columns: [table.sourceId, table.sourceType, table.targetId, table.targetType],
    }),
]);
//# sourceMappingURL=schema.js.map