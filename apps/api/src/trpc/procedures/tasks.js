import { z } from "zod";
import { eq, asc, desc } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { tasks, pomodoroSessions } from "../../db/schema.js";
import { generateId, now } from "../../utils/id.js";
export const tasksRouter = router({
    list: publicProcedure
        .input(z.object({
        status: z.enum(["todo", "in_progress", "done"]).optional(),
    }).optional())
        .query(async ({ ctx, input }) => {
        if (input?.status) {
            return ctx.db
                .select()
                .from(tasks)
                .where(eq(tasks.status, input.status))
                .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));
        }
        return ctx.db
            .select()
            .from(tasks)
            .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));
    }),
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
        const result = await ctx.db
            .select()
            .from(tasks)
            .where(eq(tasks.id, input.id));
        return result[0] ?? null;
    }),
    create: publicProcedure
        .input(z.object({
        title: z.string(),
        description: z.string().nullable().default(null),
        status: z.enum(["todo", "in_progress", "done"]).default("todo"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.string().nullable().default(null),
    }))
        .mutation(async ({ ctx, input }) => {
        const id = generateId();
        const timestamp = now();
        // Get max sort order for the status column
        const siblings = await ctx.db
            .select()
            .from(tasks)
            .where(eq(tasks.status, input.status));
        const maxOrder = siblings.reduce((max, t) => Math.max(max, t.sortOrder), -1);
        const task = {
            id,
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            dueDate: input.dueDate,
            sortOrder: maxOrder + 1,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        await ctx.db.insert(tasks).values(task);
        return task;
    }),
    update: publicProcedure
        .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().nullable().optional(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.string().nullable().optional(),
        sortOrder: z.number().optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await ctx.db
            .update(tasks)
            .set({ ...updates, updatedAt: now() })
            .where(eq(tasks.id, id));
        const result = await ctx.db.select().from(tasks).where(eq(tasks.id, id));
        return result[0] ?? null;
    }),
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.delete(tasks).where(eq(tasks.id, input.id));
        return { success: true };
    }),
    reorder: publicProcedure
        .input(z.object({
        tasks: z.array(z.object({
            id: z.string(),
            status: z.enum(["todo", "in_progress", "done"]),
            sortOrder: z.number(),
        })),
    }))
        .mutation(async ({ ctx, input }) => {
        for (const t of input.tasks) {
            await ctx.db
                .update(tasks)
                .set({ status: t.status, sortOrder: t.sortOrder, updatedAt: now() })
                .where(eq(tasks.id, t.id));
        }
        return { success: true };
    }),
    // ===== Pomodoro =====
    listPomodoros: publicProcedure
        .input(z.object({ taskId: z.string().optional() }).optional())
        .query(async ({ ctx, input }) => {
        if (input?.taskId) {
            return ctx.db
                .select()
                .from(pomodoroSessions)
                .where(eq(pomodoroSessions.taskId, input.taskId))
                .orderBy(desc(pomodoroSessions.startedAt));
        }
        return ctx.db
            .select()
            .from(pomodoroSessions)
            .orderBy(desc(pomodoroSessions.startedAt));
    }),
    startPomodoro: publicProcedure
        .input(z.object({
        taskId: z.string().nullable().default(null),
        duration: z.number().default(1500), // 25 minutes
    }))
        .mutation(async ({ ctx, input }) => {
        const id = generateId();
        const session = {
            id,
            taskId: input.taskId,
            duration: input.duration,
            startedAt: now(),
            completedAt: null,
        };
        await ctx.db.insert(pomodoroSessions).values(session);
        return session;
    }),
    completePomodoro: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db
            .update(pomodoroSessions)
            .set({ completedAt: now() })
            .where(eq(pomodoroSessions.id, input.id));
        const result = await ctx.db
            .select()
            .from(pomodoroSessions)
            .where(eq(pomodoroSessions.id, input.id));
        return result[0] ?? null;
    }),
});
//# sourceMappingURL=tasks.js.map