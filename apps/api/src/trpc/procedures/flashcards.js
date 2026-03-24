import { z } from "zod";
import { eq, lte, desc } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { flashcards, flashcardReviews } from "../../db/schema.js";
import { generateId, now } from "../../utils/id.js";
// SM-2 Algorithm
function sm2(quality, repetitions, easeFactor, interval) {
    let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEF < 1.3)
        newEF = 1.3;
    let newInterval;
    let newReps;
    if (quality < 3) {
        newReps = 0;
        newInterval = 1;
    }
    else {
        newReps = repetitions + 1;
        if (newReps === 1) {
            newInterval = 1;
        }
        else if (newReps === 2) {
            newInterval = 6;
        }
        else {
            newInterval = Math.round(interval * newEF);
        }
    }
    return { interval: newInterval, easeFactor: newEF, repetitions: newReps };
}
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString();
}
export const flashcardsRouter = router({
    list: publicProcedure.query(async ({ ctx }) => {
        return ctx.db
            .select()
            .from(flashcards)
            .orderBy(desc(flashcards.createdAt));
    }),
    getDueToday: publicProcedure.query(async ({ ctx }) => {
        const today = new Date().toISOString();
        return ctx.db
            .select()
            .from(flashcards)
            .where(lte(flashcards.nextReview, today))
            .orderBy(flashcards.nextReview);
    }),
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
        const result = await ctx.db
            .select()
            .from(flashcards)
            .where(eq(flashcards.id, input.id));
        return result[0] ?? null;
    }),
    create: publicProcedure
        .input(z.object({
        front: z.string(),
        back: z.string(),
        sourceId: z.string().nullable().default(null),
        sourceType: z.string().nullable().default(null),
    }))
        .mutation(async ({ ctx, input }) => {
        const id = generateId();
        const timestamp = now();
        const card = {
            id,
            front: input.front,
            back: input.back,
            sourceId: input.sourceId,
            sourceType: input.sourceType,
            nextReview: timestamp,
            interval: 1,
            easeFactor: "2.5",
            repetitions: 0,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        await ctx.db.insert(flashcards).values(card);
        return card;
    }),
    update: publicProcedure
        .input(z.object({
        id: z.string(),
        front: z.string().optional(),
        back: z.string().optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await ctx.db
            .update(flashcards)
            .set({ ...updates, updatedAt: now() })
            .where(eq(flashcards.id, id));
        const result = await ctx.db.select().from(flashcards).where(eq(flashcards.id, id));
        return result[0] ?? null;
    }),
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.delete(flashcardReviews).where(eq(flashcardReviews.flashcardId, input.id));
        await ctx.db.delete(flashcards).where(eq(flashcards.id, input.id));
        return { success: true };
    }),
    review: publicProcedure
        .input(z.object({
        id: z.string(),
        rating: z.number().min(0).max(5),
    }))
        .mutation(async ({ ctx, input }) => {
        // Get current card
        const cards = await ctx.db
            .select()
            .from(flashcards)
            .where(eq(flashcards.id, input.id));
        const card = cards[0];
        if (!card)
            throw new Error("Card not found");
        // Apply SM-2
        const result = sm2(input.rating, card.repetitions, parseFloat(card.easeFactor), card.interval);
        const timestamp = now();
        const nextReview = addDays(timestamp, result.interval);
        // Update card
        await ctx.db
            .update(flashcards)
            .set({
            interval: result.interval,
            easeFactor: result.easeFactor.toFixed(2),
            repetitions: result.repetitions,
            nextReview,
            updatedAt: timestamp,
        })
            .where(eq(flashcards.id, input.id));
        // Record review
        await ctx.db.insert(flashcardReviews).values({
            id: generateId(),
            flashcardId: input.id,
            rating: input.rating,
            reviewedAt: timestamp,
        });
        return { nextReview, interval: result.interval };
    }),
    stats: publicProcedure.query(async ({ ctx }) => {
        const allCards = await ctx.db.select().from(flashcards);
        const today = new Date().toISOString();
        const dueCards = allCards.filter((c) => c.nextReview <= today);
        const todayDate = new Date().toISOString().split("T")[0];
        const allReviews = await ctx.db.select().from(flashcardReviews);
        const todayReviews = allReviews.filter((r) => r.reviewedAt.startsWith(todayDate));
        return {
            total: allCards.length,
            due: dueCards.length,
            reviewedToday: todayReviews.length,
        };
    }),
});
//# sourceMappingURL=flashcards.js.map