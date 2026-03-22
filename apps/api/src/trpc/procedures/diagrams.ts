import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { diagrams } from "../../db/schema.js";
import { generateId, now } from "../../utils/id.js";

export const diagramsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(diagrams)
      .orderBy(desc(diagrams.updatedAt));
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(diagrams)
        .where(eq(diagrams.id, input.id));
      return result[0] ?? null;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().default("Sem titulo"),
        data: z.string().default("{}"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      const timestamp = now();
      const diagram = {
        id,
        title: input.title,
        data: input.data,
        thumbnail: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await ctx.db.insert(diagrams).values(diagram);
      return diagram;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        data: z.string().optional(),
        thumbnail: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      await ctx.db
        .update(diagrams)
        .set({ ...updates, updatedAt: now() })
        .where(eq(diagrams.id, id));
      const result = await ctx.db
        .select()
        .from(diagrams)
        .where(eq(diagrams.id, id));
      return result[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(diagrams).where(eq(diagrams.id, input.id));
      return { success: true };
    }),
});
