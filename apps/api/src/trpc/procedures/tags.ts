import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { tags, taggables } from "../../db/schema.js";
import { generateId } from "../../utils/id.js";

export const tagsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(tags);
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        color: z.string().default("#6366f1"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      const tag = { id, name: input.name, color: input.color };
      await ctx.db.insert(tags).values(tag);
      return tag;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      await ctx.db.update(tags).set(updates).where(eq(tags.id, id));
      const result = await ctx.db.select().from(tags).where(eq(tags.id, id));
      return result[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(taggables).where(eq(taggables.tagId, input.id));
      await ctx.db.delete(tags).where(eq(tags.id, input.id));
      return { success: true };
    }),

  // Taggables
  getForEntity: publicProcedure
    .input(
      z.object({
        entityId: z.string(),
        entityType: z.enum(["note", "document", "diagram", "task"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const associations = await ctx.db
        .select()
        .from(taggables)
        .where(
          and(
            eq(taggables.taggableId, input.entityId),
            eq(taggables.taggableType, input.entityType)
          )
        );

      const tagIds = associations.map((a) => a.tagId);
      if (tagIds.length === 0) return [];

      return ctx.db.select().from(tags).where(inArray(tags.id, tagIds));
    }),

  addToEntity: publicProcedure
    .input(
      z.object({
        tagId: z.string(),
        entityId: z.string(),
        entityType: z.enum(["note", "document", "diagram", "task"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(taggables).values({
          tagId: input.tagId,
          taggableId: input.entityId,
          taggableType: input.entityType,
        });
      } catch {
        // Already exists, ignore
      }
      return { success: true };
    }),

  removeFromEntity: publicProcedure
    .input(
      z.object({
        tagId: z.string(),
        entityId: z.string(),
        entityType: z.enum(["note", "document", "diagram", "task"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(taggables)
        .where(
          and(
            eq(taggables.tagId, input.tagId),
            eq(taggables.taggableId, input.entityId),
            eq(taggables.taggableType, input.entityType)
          )
        );
      return { success: true };
    }),
});
