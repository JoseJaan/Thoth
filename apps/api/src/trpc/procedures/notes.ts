import { z } from "zod";
import { eq, isNull, asc } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { notes } from "../../db/schema.js";
import { generateId, now } from "../../utils/id.js";

export const notesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          parentId: z.string().nullable().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId;
      if (parentId === undefined || parentId === null) {
        return ctx.db
          .select()
          .from(notes)
          .where(isNull(notes.parentId))
          .orderBy(asc(notes.sortOrder), asc(notes.createdAt));
      }
      return ctx.db
        .select()
        .from(notes)
        .where(eq(notes.parentId, parentId))
        .orderBy(asc(notes.sortOrder), asc(notes.createdAt));
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(notes)
        .where(eq(notes.id, input.id));
      return result[0] ?? null;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().default("Sem título"),
        content: z.string().default("{}"),
        parentId: z.string().nullable().default(null),
        isFolder: z.boolean().default(false),
        icon: z.string().nullable().default(null),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      const timestamp = now();

      // Get max sort order for siblings
      const siblings = input.parentId
        ? await ctx.db
            .select()
            .from(notes)
            .where(eq(notes.parentId, input.parentId))
        : await ctx.db
            .select()
            .from(notes)
            .where(isNull(notes.parentId));

      const maxOrder = siblings.reduce(
        (max, n) => Math.max(max, n.sortOrder),
        -1
      );

      const newNote = {
        id,
        title: input.title,
        content: input.content,
        contentText: "",
        parentId: input.parentId,
        isFolder: input.isFolder,
        icon: input.icon,
        sortOrder: maxOrder + 1,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await ctx.db.insert(notes).values(newNote);
      return newNote;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        contentText: z.string().optional(),
        parentId: z.string().nullable().optional(),
        icon: z.string().nullable().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      await ctx.db
        .update(notes)
        .set({ ...updates, updatedAt: now() })
        .where(eq(notes.id, id));

      const result = await ctx.db
        .select()
        .from(notes)
        .where(eq(notes.id, id));
      return result[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Recursively delete children
      const children = await ctx.db
        .select()
        .from(notes)
        .where(eq(notes.parentId, input.id));

      for (const child of children) {
        await ctx.db.delete(notes).where(eq(notes.id, child.id));
      }

      await ctx.db.delete(notes).where(eq(notes.id, input.id));
      return { success: true };
    }),

  reorder: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      for (let i = 0; i < input.ids.length; i++) {
        await ctx.db
          .update(notes)
          .set({ sortOrder: i, updatedAt: now() })
          .where(eq(notes.id, input.ids[i]));
      }
      return { success: true };
    }),
});
