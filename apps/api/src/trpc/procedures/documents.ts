import { z } from "zod";
import { eq, isNull, asc, desc } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { documents, documentFolders, documentNotes } from "../../db/schema.js";
import { generateId, now } from "../../utils/id.js";
import { savePdf, deletePdf, importFolder } from "../../services/storage.js";
import { extractTextFromPdf } from "../../services/pdf.js";
import fs from "node:fs";
import path from "node:path";
import { config } from "../../config.js";

export const documentsRouter = router({
  // ===== Document Folders =====
  listFolders: publicProcedure
    .input(
      z.object({ parentId: z.string().nullable().optional() }).optional()
    )
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId;
      if (parentId === undefined || parentId === null) {
        return ctx.db
          .select()
          .from(documentFolders)
          .where(isNull(documentFolders.parentId))
          .orderBy(asc(documentFolders.sortOrder));
      }
      return ctx.db
        .select()
        .from(documentFolders)
        .where(eq(documentFolders.parentId, parentId))
        .orderBy(asc(documentFolders.sortOrder));
    }),

  createFolder: publicProcedure
    .input(
      z.object({
        name: z.string(),
        parentId: z.string().nullable().default(null),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      const folder = {
        id,
        name: input.name,
        parentId: input.parentId,
        sortOrder: 0,
        createdAt: now(),
      };
      await ctx.db.insert(documentFolders).values(folder);
      return folder;
    }),

  deleteFolder: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Move documents in this folder to root
      await ctx.db
        .update(documents)
        .set({ folderId: null, updatedAt: now() })
        .where(eq(documents.folderId, input.id));
      await ctx.db.delete(documentFolders).where(eq(documentFolders.id, input.id));
      return { success: true };
    }),

  renameFolder: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(documentFolders)
        .set({ name: input.name })
        .where(eq(documentFolders.id, input.id));
      return { success: true };
    }),

  // ===== Documents =====
  list: publicProcedure
    .input(
      z
        .object({
          folderId: z.string().nullable().optional(),
          readingStatus: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db.select().from(documents);

      if (input?.folderId === null || input?.folderId === undefined) {
        if (input?.folderId === null) {
          query = query.where(isNull(documents.folderId)) as any;
        }
      } else {
        query = query.where(eq(documents.folderId, input.folderId)) as any;
      }

      if (input?.readingStatus) {
        query = query.where(eq(documents.readingStatus, input.readingStatus)) as any;
      }

      return query.orderBy(desc(documents.createdAt));
    }),

  listAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(documents).orderBy(desc(documents.createdAt));
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id));
      return result[0] ?? null;
    }),

  upload: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        folderId: z.string().nullable().default(null),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const { filePath } = savePdf(buffer, input.fileName);
      const extractedText = await extractTextFromPdf(buffer);

      const id = generateId();
      const timestamp = now();
      const title = input.fileName.replace(/\.pdf$/i, "");

      const doc = {
        id,
        title,
        authors: null,
        filePath,
        originalName: input.fileName,
        fileSize: buffer.length,
        readingStatus: "unread",
        extractedText,
        folderId: input.folderId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await ctx.db.insert(documents).values(doc);
      return doc;
    }),

  importFromFolder: publicProcedure
    .input(
      z.object({
        folderPath: z.string(),
        targetFolderId: z.string().nullable().default(null),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const files = await importFolder(input.folderPath);
      const imported: string[] = [];

      for (const file of files) {
        const { filePath } = savePdf(file.buffer, file.name);
        const extractedText = await extractTextFromPdf(file.buffer);

        const id = generateId();
        const timestamp = now();

        await ctx.db.insert(documents).values({
          id,
          title: file.name.replace(/\.pdf$/i, ""),
          authors: null,
          filePath,
          originalName: file.name,
          fileSize: file.size,
          readingStatus: "unread",
          extractedText,
          folderId: input.targetFolderId,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        imported.push(id);
      }

      return { imported: imported.length, ids: imported };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        authors: z.string().nullable().optional(),
        readingStatus: z.enum(["unread", "to_read", "reading", "read"]).optional(),
        summary: z.string().nullable().optional(),
        folderId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      await ctx.db
        .update(documents)
        .set({ ...updates, updatedAt: now() })
        .where(eq(documents.id, id));
      const result = await ctx.db.select().from(documents).where(eq(documents.id, id));
      return result[0] ?? null;
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
        deleteFile: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id));

      if (doc[0] && input.deleteFile) {
        deletePdf(doc[0].filePath);
      }

      // Delete associated notes
      await ctx.db.delete(documentNotes).where(eq(documentNotes.documentId, input.id));
      await ctx.db.delete(documents).where(eq(documents.id, input.id));
      return { success: true };
    }),

  // ===== Document Notes =====
  listNotes: publicProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(documentNotes)
        .where(eq(documentNotes.documentId, input.documentId))
        .orderBy(asc(documentNotes.pageNumber), asc(documentNotes.createdAt));
    }),

  createNote: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
        content: z.string().default("{}"),
        pageNumber: z.number().nullable().default(null),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      const timestamp = now();
      const note = {
        id,
        documentId: input.documentId,
        content: input.content,
        contentText: "",
        pageNumber: input.pageNumber,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await ctx.db.insert(documentNotes).values(note);
      return note;
    }),

  updateNote: publicProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().optional(),
        contentText: z.string().optional(),
        pageNumber: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      await ctx.db
        .update(documentNotes)
        .set({ ...updates, updatedAt: now() })
        .where(eq(documentNotes.id, id));
      const result = await ctx.db
        .select()
        .from(documentNotes)
        .where(eq(documentNotes.id, id));
      return result[0] ?? null;
    }),

  deleteNote: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(documentNotes).where(eq(documentNotes.id, input.id));
      return { success: true };
    }),
});
