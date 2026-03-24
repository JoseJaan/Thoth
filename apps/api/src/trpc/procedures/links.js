import { z } from "zod";
import { eq, and, or } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { links } from "../../db/schema.js";
import { now } from "../../utils/id.js";
const entityType = z.enum(["note", "document", "diagram", "task"]);
export const linksRouter = router({
    getForEntity: publicProcedure
        .input(z.object({
        entityId: z.string(),
        entityType: entityType,
    }))
        .query(async ({ ctx, input }) => {
        return ctx.db
            .select()
            .from(links)
            .where(or(and(eq(links.sourceId, input.entityId), eq(links.sourceType, input.entityType)), and(eq(links.targetId, input.entityId), eq(links.targetType, input.entityType))));
    }),
    create: publicProcedure
        .input(z.object({
        sourceId: z.string(),
        sourceType: entityType,
        targetId: z.string(),
        targetType: entityType,
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            await ctx.db.insert(links).values({
                sourceId: input.sourceId,
                sourceType: input.sourceType,
                targetId: input.targetId,
                targetType: input.targetType,
                createdAt: now(),
            });
        }
        catch {
            // Already exists
        }
        return { success: true };
    }),
    delete: publicProcedure
        .input(z.object({
        sourceId: z.string(),
        sourceType: entityType,
        targetId: z.string(),
        targetType: entityType,
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db
            .delete(links)
            .where(and(eq(links.sourceId, input.sourceId), eq(links.sourceType, input.sourceType), eq(links.targetId, input.targetId), eq(links.targetType, input.targetType)));
        return { success: true };
    }),
});
//# sourceMappingURL=links.js.map